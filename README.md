# phrases-editor
Editor for phrase files

The editor supports settings to control different features, mostly regarding the enum creation. The settings are

```json
{
"lastOpenDirectory":"this is set by the system when you open a directory",
"generateJavaEnum":true,
"translationInterface":"fully qualified name of the translation interface",
"localeInterface":"fully qualified name of your locale",
"localeService":"fully qualified way to get your localeservice",
"srcRoots":["list of folders which might be a source root of your project","usually something like src"],
"surpriseMe":false,
"filterOnEnter":false,
"highlightMatchedPhrase":false,
"customCssPath":"path to custom css file, appended last in head if set"
}
```

The user settings ends up in a file called **phrases-editor-settings.json** in your config directory. The easiest way to edit the file is to use the settings menu entry, which will open the settings file in the system default editor.
