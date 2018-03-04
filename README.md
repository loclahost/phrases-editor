# phrases-editor
Editor for phrase files

The editor supports settings to control different features, mostly regarding the enum creation. The settings are

```json
{
"lastOpenDirectory":"this is set by the system when you open a directory",
"filterOnEnter":false,
"highlightMatchedPhrase":false,
"customCssPath":"path to custom css file, appended last in head if set",
"javaGenerator" : {
	"javaFactory":"enum or class",
	"translationInterface":"fully qualified name of the translation interface",
	"localeInterface":"fully qualified name of your locale",
	"localeService":"fully qualified way to get your localeservice",
	"srcRoots":["list of folders which might be a source root of your project","usually something like src"],
},
"keyGenerator" : {
	"namespace" : "The namespace for all translations",
	"sourceLocale" : "which locale (file name) to use as source for keys"
}
}
```

The user settings ends up in a file called **phrases-editor-settings.json** in your config directory. The easiest way to edit the file is to use the settings menu entry, which will open the settings file in the system default editor.

Note of the javaFactory setting: This is due to the method-may-not-be-larger-than-64KB feature of java. If you get a "Code too large" compile error in the translation file you might want to use "class".
