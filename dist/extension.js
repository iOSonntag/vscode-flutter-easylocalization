/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(__webpack_require__(1));
const extract_to_translation_file_1 = __webpack_require__(2);
const extract_translation_code_action_provider_1 = __webpack_require__(9);
const values_1 = __webpack_require__(8);
const listeners_1 = __webpack_require__(6);
function activate(context) {
    console.log('Plugin activated');
    context.subscriptions.push(vscode.commands.registerCommand(`${values_1.Values.pluginId}.extractToTranslationForFile`, extract_to_translation_file_1.extractToTranslationForFile), vscode.commands.registerCommand(`${values_1.Values.pluginId}.extractToTranslationForGeneral`, extract_to_translation_file_1.extractToTranslationForGeneral), vscode.languages.registerCodeActionsProvider({ language: 'dart', scheme: 'file' }, new extract_translation_code_action_provider_1.ExtractTranslationCodeActionProvider()), listeners_1.configChanges, listeners_1.documentSave);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;


/***/ }),
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");

/***/ }),
/* 2 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.extractToTranslationForGeneral = exports.extractToTranslationForFile = void 0;
const vscode = __importStar(__webpack_require__(1));
const utils_1 = __webpack_require__(3);
const listeners_1 = __webpack_require__(6);
const extractToTranslationForFile = async () => {
    const fileName = (0, utils_1.currentFileName)();
    const prefix = (0, utils_1.fileNameToPrefix)(fileName) + '_';
    await extractToTranslationFile(prefix);
};
exports.extractToTranslationForFile = extractToTranslationForFile;
const extractToTranslationForGeneral = async () => {
    await extractToTranslationFile(listeners_1.pluginConfig.generalTranslationPrefix);
};
exports.extractToTranslationForGeneral = extractToTranslationForGeneral;
const extractToTranslationFile = async (prefix) => {
    try {
        const translationFiles = await getTranslationFiles();
        const selectText = (0, utils_1.selectedText)().trim();
        const keyName = await getKeyName(prefix);
        const listTranslations = await getTranslationTexts(translationFiles, selectText);
        await modifyTranslationFiles(translationFiles, prefix, keyName, listTranslations);
        await modifyCurrentFile(prefix + keyName);
        await runGenerationCommand();
        console.log('Key name', keyName);
        console.log('listTranslations', listTranslations);
        vscode.window.showInformationMessage('Done!');
    }
    catch (error) {
        console.log('error', error);
        vscode.window.showErrorMessage(error.message);
        return;
    }
};
async function getKeyName(prefix) {
    const keyName = (await (0, utils_1.showPrompt)(`Enter key name.\n\nResult:\n${prefix}<<Key name>>`, 'Key name') ?? '').trim();
    if (keyName === '') {
        throw new Error('Key name can\'t be empty');
    }
    // check if key name only contains letters, numbers and underscores
    const pattern = /^[a-zA-Z0-9_]+$/g;
    const match = RegExp(pattern).exec(keyName);
    if (!match) {
        throw new Error('Key name can only contain letters, numbers and underscores');
    }
    return keyName;
}
async function getTranslationTexts(translationFiles, selectText) {
    let listTranslations = [];
    for (const translationFile of translationFiles) {
        const parts = translationFile.path.split('/');
        const fileName = parts[parts.length - 1];
        const language = fileName.substring(0, fileName.lastIndexOf('.'));
        const fiTranslation = (await (0, utils_1.showPrompt)(`Enter correct translation for: ${language}`, selectText) ?? '').trim();
        if (fiTranslation === '') {
            listTranslations.push(selectText);
        }
        else {
            listTranslations.push(fiTranslation);
        }
    }
    return listTranslations;
}
async function getTranslationFiles() {
    const projectRoot = (0, utils_1.getFlutterRoot)();
    const translationDir = listeners_1.pluginConfig.translationDir;
    let pattern = `${projectRoot}/${translationDir}/*.json`;
    if (pattern.startsWith('/')) {
        pattern = pattern.substring(1);
    }
    console.log('pattern', pattern);
    const translationFiles = await vscode.workspace.findFiles(pattern);
    if (translationFiles.length === 0) {
        throw new Error(`Couldn't find any translation files in ${translationDir}`);
    }
    return translationFiles;
}
function sortObjectKeysAlphabetically(obj) {
    const sortedObj = {};
    Object.keys(obj).sort().forEach(key => {
        sortedObj[key] = obj[key];
    });
    return sortedObj;
}
async function modifyTranslationFiles(translationFiles, keyPrefix, keyName, listTranslations) {
    for (let i = 0; i < translationFiles.length; i++) {
        const translationFile = translationFiles[i];
        const translation = listTranslations[i];
        await addTranslation(translationFile, keyPrefix, keyName, translation);
    }
}
async function addTranslation(file, keyPrefix, keyName, translation) {
    const uint8Array = await vscode.workspace.fs.readFile(file);
    const fileContent = new TextDecoder().decode(uint8Array);
    let json = JSON.parse(fileContent);
    if (json[keyPrefix + keyName]) {
        throw new Error(`Key ${keyPrefix + keyName} already exists in ${file.fsPath}`);
    }
    json[keyPrefix + keyName] = translation;
    if (listeners_1.pluginConfig.sortKeysAlphabetically) {
        json = sortObjectKeysAlphabetically(json);
    }
    await vscode.workspace.fs.writeFile(file, Buffer.from(JSON.stringify(json, null, 2)));
}
async function modifyCurrentFile(keyName) {
    await (0, utils_1.replaceSelectedText)(`LocaleKeys.${keyName}.tr()`);
    const importStatementEasyLocalization = 'package:easy_localization/easy_localization.dart';
    const importStatementGenerated = listeners_1.pluginConfig.getGeneratedFileImportStatement();
    await (0, utils_1.addImportToCurrentFileIfNeeded)(importStatementEasyLocalization);
    await (0, utils_1.addImportToCurrentFileIfNeeded)(importStatementGenerated);
}
async function runGenerationCommand() {
    try {
        const sourceDir = listeners_1.pluginConfig.translationDir;
        const outDir = listeners_1.pluginConfig.generatedKeyFileDir;
        const outFile = listeners_1.pluginConfig.generatedKeyFileName;
        const command = `flutter pub run easy_localization:generate -f keys --source-dir ${sourceDir} --output-dir ${outDir} --output-file ${outFile}`;
        const flutterRoot = (0, utils_1.getFlutterRoot)(false);
        console.log('flutterRoot', flutterRoot);
        console.log('command', command);
        const result = await (0, utils_1.runShellCommand)(command, flutterRoot);
        console.log('result', result);
    }
    catch (error) {
        console.error('easy_localization:generate', error);
        if (error.message.includes('command not found')) {
            throw new Error('easy_localization:generate command not found. Please install easy_localization package.');
        }
        throw error;
    }
}


/***/ }),
/* 3 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.addImportToCurrentFileIfNeeded = exports.getFlutterProjectPackageName = exports.runShellCommand = exports.showPrompt = exports.editSelection = exports.fileNameToPrefix = exports.getFlutterRoot = exports.replaceSelectedText = exports.selectedText = exports.currentFileName = exports.currentPath = exports.currentFile = void 0;
const vscode = __importStar(__webpack_require__(1));
const fs = __importStar(__webpack_require__(4));
const currentFile = () => vscode.window.activeTextEditor.document.uri;
exports.currentFile = currentFile;
const currentPath = () => (0, exports.currentFile)().path;
exports.currentPath = currentPath;
const currentFileName = () => (0, exports.currentPath)().substring((0, exports.currentPath)().lastIndexOf('/') + 1, (0, exports.currentPath)().lastIndexOf('.'));
exports.currentFileName = currentFileName;
const selectedText = () => {
    const editor = vscode.window.activeTextEditor;
    const stringRange = getOuterStringRange();
    const text = editor.document.getText(stringRange);
    return text.substring(1, text.length - 1);
};
exports.selectedText = selectedText;
const replaceSelectedText = async (replacement) => {
    const editor = vscode.window.activeTextEditor;
    const stringRange = getOuterStringRange();
    if (!stringRange) {
        return;
    }
    await editor.edit(editBuilder => {
        editBuilder.replace(stringRange, replacement);
    });
};
exports.replaceSelectedText = replaceSelectedText;
/**
 * Returns the relative path to the flutter project directory. It uses the
 * current path and then goes up the directory tree until it finds a directory
 * that contains a pubspec.yaml file.
 *
 * The most top directory is the visual studio code workspace directory.
 */
function getFlutterRoot(relativePath = true) {
    let vscodeWorkspace = vscode.workspace.workspaceFolders[0].uri.path;
    let path = (0, exports.currentPath)();
    while (path !== '/' && path !== '') {
        if (fs.existsSync(`${path}/pubspec.yaml`) || fs.existsSync(`${path}/pubspec.yml`)) {
            // found a pubspec.yaml file
            if (relativePath) {
                return path.substring(vscodeWorkspace.length + 1);
            }
            return path;
        }
        if (path === vscodeWorkspace) {
            // last resort to check
            break;
        }
        path = path.substring(0, path.lastIndexOf('/'));
    }
    throw new Error('Couldn\'t find flutter root directory');
}
exports.getFlutterRoot = getFlutterRoot;
/**
 * Converts the filename to a prefix. It removes the file extension and converts
 * snake case to camel case.
 */
function fileNameToPrefix(fileName) {
    const words = fileName.split('_');
    return words.map((word, index) => {
        if (index === 0) {
            return word;
        }
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join('');
}
exports.fileNameToPrefix = fileNameToPrefix;
function editSelection(newText) {
    vscode.window.activeTextEditor?.edit((builder) => {
        builder.replace(vscode.window.activeTextEditor.selection, newText);
    });
}
exports.editSelection = editSelection;
function showPrompt(title, placeholder) {
    const inputText = {
        prompt: title,
        placeHolder: placeholder,
    };
    return vscode.window.showInputBox(inputText);
}
exports.showPrompt = showPrompt;
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
let terminalId = undefined;
async function runShellCommand(command, directory) {
    const terminal = await createTerminal('EasyLocalization');
    terminalId = await terminal.processId;
    terminal.sendText(`cd ${directory}`);
    terminal.sendText(command);
}
exports.runShellCommand = runShellCommand;
async function createTerminal(name) {
    const terminals = vscode.window.terminals;
    for (const terminal of terminals) {
        if (terminal.name === name || (await terminal.processId) === terminalId) {
            if (!terminal.exitStatus) {
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
function getOuterStringRange() {
    const editor = vscode.window.activeTextEditor;
    const document = editor.document;
    const cursorPos = editor.selection.active;
    const line = document.lineAt(cursorPos);
    let firstDelimiter = null;
    let lastDelimiter = null;
    let delimiterType = null;
    let isEscape = false;
    for (let i = 0; i < line.text.length; i++) {
        const char = line.text[i];
        // Handle escape character
        if (char === '\\' && !isEscape) {
            isEscape = true;
            continue;
        }
        if ((char === "'" || char === '"' || char === '`') && !isEscape) {
            if (firstDelimiter === null) {
                firstDelimiter = i;
                delimiterType = char;
            }
            else if (char === delimiterType) {
                lastDelimiter = i;
                break;
            }
        }
        isEscape = false;
    }
    if (firstDelimiter !== null && lastDelimiter !== null) {
        const start = new vscode.Position(line.lineNumber, firstDelimiter);
        const end = new vscode.Position(line.lineNumber, lastDelimiter + 1);
        return new vscode.Range(start, end);
    }
    return undefined;
}
function getFlutterProjectPackageName() {
    const pubspec = fs.readFileSync(`${getFlutterRoot(false)}/pubspec.yaml`).toString();
    const regex = /name:\s*(.*)/;
    const match = pubspec.match(regex);
    if (!match) {
        throw new Error('Couldn\'t find package name in pubspec.yaml');
    }
    return match[1];
}
exports.getFlutterProjectPackageName = getFlutterProjectPackageName;
async function addImportToCurrentFileIfNeeded(importStatement) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }
    const document = editor.document;
    const text = document.getText();
    if (!text.includes(importStatement)) {
        const firstLine = document.lineAt(0);
        await editor.edit(editBuilder => {
            editBuilder.insert(firstLine.range.start, `import '${importStatement}';\n`);
        });
    }
}
exports.addImportToCurrentFileIfNeeded = addImportToCurrentFileIfNeeded;


/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = require("fs");

/***/ }),
/* 5 */,
/* 6 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.documentSave = exports.configChanges = exports.pluginConfig = void 0;
const vscode = __importStar(__webpack_require__(1));
const plugin_config_1 = __webpack_require__(7);
const values_1 = __webpack_require__(8);
exports.pluginConfig = new plugin_config_1.PluginConfig();
exports.configChanges = vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration(values_1.Values.pluginId)) {
        exports.pluginConfig = new plugin_config_1.PluginConfig();
    }
});
exports.documentSave = vscode.workspace.onDidSaveTextDocument(async (e) => {
    // if (myConfig.addCopyRightOnSave)
    // {
    //   addDynamicCopyright();
    // }
});


/***/ }),
/* 7 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PluginConfig = void 0;
const vscode = __importStar(__webpack_require__(1));
const values_1 = __webpack_require__(8);
const utils_1 = __webpack_require__(3);
class PluginConfig {
    translationDir;
    generalTranslationPrefix;
    sortKeysAlphabetically;
    generatedKeyFileDir;
    generatedKeyFileName;
    constructor() {
        const config = vscode.workspace.getConfiguration(values_1.Values.pluginId);
        this.translationDir = config.get('translationDir') ?? 'assets/translations';
        this.generalTranslationPrefix = config.get('generalTranslationPrefix') ?? 'general_';
        this.sortKeysAlphabetically = config.get('sortKeysAlphabetically') ?? true;
        this.generatedKeyFileDir = config.get('generatedKeyFileDir') ?? 'lib/generated';
        this.generatedKeyFileName = config.get('generatedKeyFileName') ?? 'locale_keys.g.dart';
    }
    getGeneratedFileImportStatement() {
        const flutterProjectPackageName = (0, utils_1.getFlutterProjectPackageName)();
        let fileDir = this.generatedKeyFileDir;
        if (fileDir.startsWith('lib/')) {
            fileDir = fileDir.substring(4);
        }
        return `package:${flutterProjectPackageName}/${fileDir}/${this.generatedKeyFileName}`;
    }
}
exports.PluginConfig = PluginConfig;


/***/ }),
/* 8 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.pluginId = exports.Values = void 0;
exports.Values = __importStar(__webpack_require__(8));
exports.pluginId = 'fluttereasylocalization';


/***/ }),
/* 9 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ExtractTranslationCodeActionProvider = void 0;
const vscode = __importStar(__webpack_require__(1));
const values_1 = __webpack_require__(8);
class ExtractTranslationCodeActionProvider {
    provideCodeActions(document, range) {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return [];
        }
        return [
            {
                command: `${values_1.Values.pluginId}.extractToTranslationForFile`,
                title: "EasyLocalization: Extract translation for this file",
            },
            {
                command: `${values_1.Values.pluginId}.extractToTranslationForGeneral`,
                title: "EasyLocalization: Extract translation as general purpose string",
            },
        ].map((c) => {
            let action = new vscode.CodeAction(c.title, vscode.CodeActionKind.Refactor);
            action.command = {
                command: c.command,
                title: c.title,
            };
            return action;
        });
    }
}
exports.ExtractTranslationCodeActionProvider = ExtractTranslationCodeActionProvider;


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(0);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=extension.js.map