import * as vscode from 'vscode';
import * as fs from 'fs';
import { exec, spawn } from 'child_process';

export const currentFile = () => vscode.window.activeTextEditor!.document.uri;
export const currentPath = () => currentFile().path;
export const currentFileName = () => currentPath().substring(currentPath().lastIndexOf('/') + 1, currentPath().lastIndexOf('.'));



export const selectedText = () =>
{
  const editor = vscode.window.activeTextEditor!;
  const stringRange = getOuterStringRange();
  const text = editor.document.getText(stringRange);

  return text.substring(1, text.length - 1);
};

export const replaceSelectedText = async (replacement: string) =>
{
  const editor = vscode.window.activeTextEditor!;
  const stringRange = getOuterStringRange();

  if (!stringRange)
  {
    return;
  }

  await editor.edit(editBuilder =>
  {
    editBuilder.replace(stringRange, replacement);
  });
};


/**
 * Returns the relative path to the flutter project directory. It uses the
 * current path and then goes up the directory tree until it finds a directory
 * that contains a pubspec.yaml file.
 * 
 * The most top directory is the visual studio code workspace directory.
 */
export function getFlutterRoot(relativePath: boolean = true): string
{
  let vscodeWorkspace = vscode.workspace.workspaceFolders![0].uri.path;
  let path = currentPath();
	
  // If platform is windows and path starts with / then remove the first slash
  if (process.platform === "win32" && path.startsWith("/")) {
    path = path.slice(1);
    vscodeWorkspace = vscodeWorkspace.slice(1);
  }

  while (path !== '/' && path !== '')
  {
    if (fs.existsSync(`${path}/pubspec.yaml`) || fs.existsSync(`${path}/pubspec.yml`))
    {
      // found a pubspec.yaml file
      if (relativePath) 
      {
        return path.substring(vscodeWorkspace.length + 1);
      }

      return path;
    }

    if (path === vscodeWorkspace)
    {
      // last resort to check
      break;
    }

    path = path.substring(0, path.lastIndexOf('/'));
  }

  throw new Error('Couldn\'t find flutter root directory');
}

/**
 * Converts the filename to a prefix. It removes the file extension and converts
 * snake case to camel case. 
 */
export function fileNameToPrefix(fileName: string): string
{
  const words = fileName.split('_');

  return words.map((word, index) =>
  {
    if (index === 0)
    {
      return word;
    }

    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join('');
}


export function editSelection(newText: string)
{
  vscode.window.activeTextEditor?.edit((builder) =>
  {
    builder.replace(vscode.window.activeTextEditor!.selection, newText);
  });
}

export function showPrompt(title: string, placeholder: string): Thenable<string | undefined>
{
  const inputText: vscode.InputBoxOptions = {
    prompt: title,
    placeHolder: placeholder,
  };

  return vscode.window.showInputBox(inputText);
}


// export function runShellCommand(command: string, directory: string): Promise<string>
// {
//   return new Promise((resolve, reject) => {
//     // Determine the shell to use, e.g., bash, cmd.exe, depending on the platform
//     const shell = process.platform === 'win32' ? 'cmd.exe' : '/bin/zsh';

//     // Options for spawn, including the working directory
//     const options = {
//       cwd: directory, // set the current working directory
//       shell: true // use the shell option for better compatibility
//     };

//     // Spawn a new shell with the specified options
//     const child = spawn(shell, ['-c', command], options);

//     let stdoutData = '';
//     let stderrData = '';

//     // Collect data from stdout
//     child.stdout.on('data', (data) => {
//       stdoutData += data;
//     });

//     // Collect data from stderr
//     child.stderr.on('data', (data) => {
//       stderrData += data;
//     });

//     // Handle the close event
//     child.on('close', (code) => {
//       if (code === 0) {
//         resolve(stdoutData);
//       } else {
//         reject(new Error(`Command failed with exit code ${code}: ${stderrData}`));
//       }
//     });

//     // Handle errors
//     child.on('error', (error) => {
//       reject(error);
//     });
//   });
// }

let terminalId: number | undefined = undefined;

export async function runShellCommand(command: string, directory: string)
{
  const terminal = await createTerminal('EasyLocalization');
  terminalId = await terminal.processId;
  terminal.sendText(`cd ${directory}`);
  terminal.sendText(command);
}

async function createTerminal(name: string): Promise<vscode.Terminal>
{
	const terminals = <vscode.Terminal[]>(<any>vscode.window).terminals;

  for (const terminal of terminals)
  {
    if (terminal.name === name || (await terminal.processId) === terminalId)
    {
      if (!terminal.exitStatus)
      {
        return terminal;
      }

      break;
    }
  }

  return vscode.window.createTerminal(name);
}

// export function runShellCommand(command: string, directory: string): Promise<string>
// {
//   return new Promise((resolve, reject) =>
//   {
//     console.log(process.env.PATH);

//     exec(command, { cwd: directory }, (error, stdout, stderr) =>
//     {
//       if (error)
//       {
//         reject(error);
//         return;
//       }

//       if (stderr.trim() !== '')
//       {
//         reject(new Error(stderr));
//         return;
//       }

//       resolve(stdout);
//     });
//   });
// }

// export function readFile(path: string): Promise<string>
// {
//   return new Promise<string>((resolve, reject) =>
//   {
//     fs.readFile(path, 'utf8', (err, data) =>
//     {
//       if (err)
//       {
//         reject(new Error(`Couldn't read file due to error: ${err}`));
//         return;
//       }
      
//       resolve(data);
//     });
//   });
// }

// export function writeFile(path: string, data: string)
// {
//   return new Promise<void>((resolve, reject) =>
//   {
//     fs.writeFile(path, data, 'utf8', (err) =>
//     {
//       if (err)
//       {
//         reject(new Error(`Couldn't write file due to error: ${err}`));
//         return;
//       } 
      
//       resolve();
//     });
//   });
// }




function getOuterStringRange(): vscode.Range | undefined
{
  const editor = vscode.window.activeTextEditor!;
  const document = editor.document;
  const cursorPos = editor.selection.active;
  const line = document.lineAt(cursorPos);

  let firstDelimiter: number | null = null;
  let lastDelimiter: number | null = null;
  let delimiterType: "'" | '"' | '`' | null = null;
  let isEscape = false;

  for (let i = 0; i < line.text.length; i++)
  {
    const char = line.text[i];

    // Handle escape character
    if (char === '\\' && !isEscape) {
      isEscape = true;
      continue;
    }

    if ((char === "'" || char === '"' || char === '`') && !isEscape)
    {
      if (firstDelimiter === null)
      {
        firstDelimiter = i;
        delimiterType = char;
      } 
      else if (char === delimiterType)
      {
        lastDelimiter = i;
        break;
      }
    }
    isEscape = false;
  }

  if (firstDelimiter !== null && lastDelimiter !== null)
  {
    const start = new vscode.Position(line.lineNumber, firstDelimiter);
    const end = new vscode.Position(line.lineNumber, lastDelimiter + 1);
    return new vscode.Range(start, end);
  }

  return undefined;
}




export function getFlutterProjectPackageName(): string
{
  const pubspec = fs.readFileSync(`${getFlutterRoot(false)}/pubspec.yaml`).toString();

  const regex = /name:\s*(.*)/;
  const match = pubspec.match(regex);
  
  if (!match)
  {
    throw new Error('Couldn\'t find package name in pubspec.yaml');
  }

  return match[1];
}


export async function addImportToCurrentFileIfNeeded(importStatement: string)
{
  const editor = vscode.window.activeTextEditor;

  if (!editor)
  {
    return;
  }

  const document = editor.document;
  const text = document.getText();
  
  if (!text.includes(importStatement))
  {
    const firstLine = document.lineAt(0);

    await editor.edit(editBuilder => {
        editBuilder.insert(firstLine.range.start, `import '${importStatement}';\n`);
    });
  }
}
