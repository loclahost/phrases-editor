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
"srcRoots":["list of folders which might be a source root of your project","usually something like src"]
}
```

put them in a file called **phrases-editor-settings.json** in **~/.config/Electron/**. The enum will become unusable without these settings.
