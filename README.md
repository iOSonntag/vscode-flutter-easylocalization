# VSCode Plugin: Flutter EasyLocalization

![Dynamic JSON
Badge](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2FiOSonntag%2Fvscode-flutter-easylocalization%2Fmaster%2Fpackage.json&query=%24.version&label=version)
![Static Badge](https://img.shields.io/badge/strict-d?label=TypeScript)



Extract strings into localization files and generate all translations while
doing so, all from the comfort of staying in the development file.

**Showcase**
<video src="resources/easy_localization.mov?raw=true" width="500">



## Features

- extract current file's strings into localization files
- generate all translations for the extracted strings
- decide if the string is for the current file or for the whole project
  (general)

## What it does:

- extracts the current strings into the localization files
- asks for the translation for each language available
- puts the translations into the localization files
- generates the key file for the translations
- replaces the strings in the current file with the generated keys
- updates imports to access the generated key file

>**Or simply put**  
>Makes your translation workflow a lot easier and faster.

## Note on the underlying package

This plugin is based on the
[EasyLocalization](https://pub.dev/packages/easy_localization) package.
You need to add this package to your `pubspec.yaml` file in order to use this
plugin. 

>**Also note**  
>This plugin is not affiliated with the package in any way.  
>
>Meaning:  
>The credit of the translation engine itself goes to the
>[EasyLocalization](https://pub.dev/packages/easy_localization) package.


## Settings


- **translationDir**  
*The relative directory where the translations files live in.*  
default: `assets/translations`
- **generalTranslationPrefix**  
*The prefix for translations keys to use when extracting for genewral purpose.*  
default: `general_`

- **sortKeysAlphabetically**  
*If the translation files should be sorted alphabetically after generation.*  
default: `true`

- **generatedKeyFileDir**  
*The relative directory where the generated key file should be saved to.*  
default: `lib/generated`

- **generatedKeyFileName**  
*The name of the generated key file.*  
default: `locale_keys.g.dart`


## Bugs

Please report any issues at: [Flutter EasyLocalization VSCode Plugin - GitHub Repository](https://github.com/iOSonntag/vscode-flutter-easylocalization/issues)


## Contribution

Pull requests are **WELCOME** !

If you have improvements or feel like you can solve a bug, please do not
hesitate to submit a pull requests. 

**Even if you think you might not be skilled
enough. That is pure bullsh*t. We are all beginners - all the time :)**

## Support This Plugin

If you like this plugin and want to support it - submit a feature request, a
pull request or simply buy me
a little coffee :) - Thank You.

<a href="https://www.buymeacoffee.com/iOSonntag" target="_blank"><img
src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A
Coffee" style="height: 60px !important;width: 217px !important;" ></a>

or direct via
- [Buy Me A Coffee](https://www.buymeacoffee.com/iOSonntag)
- [GitHub Sponsor](https://github.com/sponsors/iOSonntag)
- [PayPal](https://paypal.com/paypalme/iOSonntag/20)
- [Homepage](https://iOSonntag.com/buy-me-a-coffe)

## DISCLAIMER

I disclaim that I forgot to disclaim the right disclaims.