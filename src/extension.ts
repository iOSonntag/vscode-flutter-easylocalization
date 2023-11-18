
import * as vscode from 'vscode';
import { extractToTranslationForFile, extractToTranslationForGeneral } from './commands/extract-to-translation-file';
import { ExtractTranslationCodeActionProvider } from './code_actions/extract-translation-code-action-provider';
import { Values } from './config/values';
import { configChanges, documentSave } from './config/listeners';

export function activate(context: vscode.ExtensionContext)
{
  console.log('Plugin activated');
  
  context.subscriptions.push(
    vscode.commands.registerCommand(`${Values.pluginId}.extractToTranslationForFile`, extractToTranslationForFile),
    vscode.commands.registerCommand(`${Values.pluginId}.extractToTranslationForGeneral`, extractToTranslationForGeneral),
    vscode.languages.registerCodeActionsProvider(
      { language: 'dart', scheme: 'file' },
      new ExtractTranslationCodeActionProvider()
    ),
    configChanges,
    documentSave
  );
}

export function deactivate() {}
