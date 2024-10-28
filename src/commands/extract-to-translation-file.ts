import * as vscode from 'vscode';
import { addImportToCurrentFileIfNeeded, currentFile, currentFileName, fileNameToPrefix, getFlutterProjectPackageName, getFlutterRoot, replaceSelectedText, runShellCommand, selectedText, showPrompt } from '../utils/utils';
import { pluginConfig } from '../config/listeners';

export const extractToTranslationForFile = async () =>
{
  const fileName = currentFileName();

  const prefix = fileNameToPrefix(fileName) + '_';

  await extractToTranslationFile(prefix);
};

export const extractToTranslationForGeneral = async () =>
{
  await extractToTranslationFile(pluginConfig.generalTranslationPrefix);
};

export const regenerateTranslationKeys = async () =>
{
  try
  {
    await runGenerationCommand();
    vscode.window.showInformationMessage('Done!');
  }
  catch (error: any)
  {
    console.log('error', error);
    vscode.window.showErrorMessage(error.message);
    return;
  }
}

const extractToTranslationFile = async (prefix: string) =>
{
  try
  {


    const translationFiles = await getTranslationFiles();
    const selectText = selectedText().trim();
    const keyName = await getKeyName(prefix);
    const listTranslations = await getTranslationTexts(translationFiles, selectText);

    await modifyTranslationFiles(translationFiles, prefix, keyName, listTranslations);


    await modifyCurrentFile(prefix + keyName);
    await runGenerationCommand();

    console.log('Key name', keyName);
    console.log('listTranslations', listTranslations);
    

    vscode.window.showInformationMessage('Done!');
  }
  catch (error: any)
  {
    console.log('error', error);
    vscode.window.showErrorMessage(error.message);
    return;
  }

};


async function getKeyName(prefix: string)
{
  const keyName = (await showPrompt(`Enter key name.\n\nResult:\n${prefix}<<Key name>>`, 'Key name') ?? '').trim();

  if (keyName === '')
  {
    throw new Error('Key name can\'t be empty');
  }

  // check if key name only contains letters, numbers and underscores
  const pattern = /^[a-zA-Z0-9_]+$/g;
  const match = RegExp(pattern).exec(keyName);

  if (!match)
  {
    throw new Error('Key name can only contain letters, numbers and underscores');
  }

  return keyName;
}


async function getTranslationTexts(translationFiles: vscode.Uri[], selectText: string)
{
  let listTranslations = [];

  for (const translationFile of translationFiles)
  {
    const parts = translationFile.path.split('/');
    const fileName = parts[parts.length - 1];
    const language = fileName.substring(0, fileName.lastIndexOf('.'));
    const fiTranslation = (await showPrompt(`Enter correct translation for: ${language}`, selectText) ?? '').trim();

    if (fiTranslation === '')
    {
      listTranslations.push(selectText);
    }
    else
    {
      listTranslations.push(fiTranslation);
    }
  }

  return listTranslations;
}


async function getTranslationFiles()
{
  const projectRoot = getFlutterRoot();
  const translationDir = pluginConfig.translationDir;
  let pattern = `${projectRoot}/${translationDir}/*.json`;

  if (pattern.startsWith('/'))
  {
    pattern = pattern.substring(1);
  }

  console.log('pattern', pattern);

  const translationFiles = await vscode.workspace.findFiles(pattern);

  if (translationFiles.length === 0)
  {
    throw new Error(`Couldn't find any translation files in ${translationDir}`);
  }

  translationFiles.sort((a: any, b: any) => a.path.localeCompare(b.path));

  return translationFiles;
}


function sortObjectKeysAlphabetically(obj: any)
{
  const sortedObj: any = {};

  Object.keys(obj).sort().forEach(key =>
  {
    sortedObj[key] = obj[key];
  });

  return sortedObj;
}

async function modifyTranslationFiles(translationFiles: vscode.Uri[], keyPrefix: string, keyName: string, listTranslations: string[])
{
  for (let i = 0; i < translationFiles.length; i++)
  {
    const translationFile = translationFiles[i];
    const translation = listTranslations[i];

    await addTranslation(translationFile, keyPrefix, keyName, translation);
  }
}


async function addTranslation(file: vscode.Uri, keyPrefix: string, keyName: string, translation: string)
{
  const uint8Array = await vscode.workspace.fs.readFile(file);
  const fileContent = new TextDecoder().decode(uint8Array);
  let json = JSON.parse(fileContent);

  if (json[keyPrefix + keyName])
  {
    throw new Error(`Key ${keyPrefix + keyName} already exists in ${file.fsPath}`);
  }

  json[keyPrefix + keyName] = translation.replaceAll('\\n', '\n');

  if (pluginConfig.sortKeysAlphabetically)
  {
    json = sortObjectKeysAlphabetically(json);
  }

  await vscode.workspace.fs.writeFile(file, Buffer.from(JSON.stringify(json, null, 2)));
  
}

async function modifyCurrentFile(keyName: string)
{
  await replaceSelectedText(`LocaleKeys.${keyName}.tr()`);

  const importStatementEasyLocalization = 'package:easy_localization/easy_localization.dart';
  const importStatementGenerated = pluginConfig.getGeneratedFileImportStatement();
  
  await addImportToCurrentFileIfNeeded(importStatementEasyLocalization);
  await addImportToCurrentFileIfNeeded(importStatementGenerated);
}

async function runGenerationCommand()
{
  try
  {
    const sourceDir = pluginConfig.translationDir;
    const outDir = pluginConfig.generatedKeyFileDir;
    const outFile = pluginConfig.generatedKeyFileName;
  
    const command = `dart run easy_localization:generate -f keys --source-dir ${sourceDir} --output-dir ${outDir} --output-file ${outFile}`;
  
    const flutterRoot = getFlutterRoot(false);
  
    console.log('flutterRoot', flutterRoot);
    console.log('command', command);
  
    const result = await runShellCommand(command, flutterRoot);
  
    
  
    
  
    console.log('result', result);
  } 
  catch (error: any)
  {
    console.error('easy_localization:generate', error);
  
    if (error.message.includes('command not found'))
    {
      throw new Error('easy_localization:generate command not found. Please install easy_localization package.');
    }

    throw error;
  }
}
