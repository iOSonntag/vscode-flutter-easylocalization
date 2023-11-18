import * as vscode from 'vscode';
import { Values } from './values';
import { getFlutterProjectPackageName } from '../utils/utils';

export class PluginConfig {

  translationDir: string;
  generalTranslationPrefix: string;
  sortKeysAlphabetically: boolean;
  generatedKeyFileDir: string;
  generatedKeyFileName: string;

  constructor()
  {
    const config = vscode.workspace.getConfiguration(Values.pluginId) as vscode.WorkspaceConfiguration;

    this.translationDir = config.get('translationDir') ?? 'assets/translations';
    this.generalTranslationPrefix = config.get('generalTranslationPrefix') ?? 'general_';
    this.sortKeysAlphabetically = config.get('sortKeysAlphabetically') ?? true;
    this.generatedKeyFileDir = config.get('generatedKeyFileDir') ?? 'lib/generated';
    this.generatedKeyFileName = config.get('generatedKeyFileName') ?? 'locale_keys.g.dart';
  }

  getGeneratedFileImportStatement(): string
  {
    const flutterProjectPackageName = getFlutterProjectPackageName();

    let fileDir = this.generatedKeyFileDir;

    if (fileDir.startsWith('lib/'))
    {
      fileDir = fileDir.substring(4);
    }

    return `package:${flutterProjectPackageName}/${fileDir}/${this.generatedKeyFileName}`;
  }
}