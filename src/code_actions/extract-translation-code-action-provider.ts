import * as vscode from "vscode";
import { selectedText } from "../utils/utils";
import { Values } from '../config/values';

export class ExtractTranslationCodeActionProvider implements vscode.CodeActionProvider
{
  public provideCodeActions(document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction[]
  {
    const editor = vscode.window.activeTextEditor;

    if (!editor) 
    {
      return [];
    }
    
    return [
      {
        command: `${Values.pluginId}.extractToTranslationForFile`,
        title: "EasyLocalization: Extract translation for this file",
      },
      {
        command: `${Values.pluginId}.extractToTranslationForGeneral`,
        title: "EasyLocalization: Extract translation as general purpose string",
      },
    ].map((c) => {
      let action = new vscode.CodeAction(
        c.title,
        vscode.CodeActionKind.Refactor
      );
      action.command = {
        command: c.command,
        title: c.title,
      };
      return action;
    });
  }
}