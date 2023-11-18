import * as vscode from 'vscode';
import { PluginConfig } from './plugin-config';
import { Values } from './values';

export let pluginConfig = new PluginConfig();

export const configChanges = vscode.workspace.onDidChangeConfiguration((e) =>
{
  if (e.affectsConfiguration(Values.pluginId))
  {
    pluginConfig = new PluginConfig();
  }
});

export const documentSave = vscode.workspace.onDidSaveTextDocument(async (e: vscode.TextDocument) =>
{
  // if (myConfig.addCopyRightOnSave)
  // {
  //   addDynamicCopyright();
  // }
});