# phrases-editor
Editor for phrase files

The editor supports settings to control different features, mostly regarding the enum creation. The settings are

```json
{
	"lastOpenDirectory":"this is set by the system when you open a directory",
	"filterOnEnter":false,
	"highlightMatchedPhrase":false,
	"customCssPath":"path to custom css file, appended last in head if set",
	"noConfirmDestructiveLoad":false,
	"sortType": "natural (AaBb) or ascii (ABab)",
	"javaGenerator" : {
		"javaFactory":"enum or class",
		"translationInterface":"fully qualified name of the translation interface",
		"localeInterface":"fully qualified name of your locale",
		"localeService":"fully qualified way to get your localeservice",
		"srcRoots":["list of folders which might be a source root of your project","usually something like src"]
	},
	"keyGenerator" : {
		"namespace" : "The namespace for all translations",
		"sourceLocale" : "which locale (file name) to use as source for keys"
	}
}
```

The user settings ends up in a file called **phrases-editor-settings.json** in your config directory. The easiest way to edit the file is to use the settings menu entry, which will open the settings file in the system default editor.

Note of the javaFactory setting: This is due to the method-may-not-be-larger-than-64KB feature of java. If you get a "Code too large" compile error in the translation file you might want to use "class".

Note on project settings: Project settings must reside in the same folder as the phrases files and will be detected automaticly on load. Settings in the project files will override settings on the top level of the user settings. This means that there are no merging of subobjects, so any settings using an object must be overrided in its entirety. This is scheduled to change in the 3.0.0 release, so that you only need to override the settings you want to change. 

## Release notes

### 2.2.0
* Feature: Added sortType to set if the files should be sorted in natural (deafult) or ascii order. Thanks to @Caresilabs
* Feature: Added to ability to have a configuration file in the same folder as the phrases files for those projects where you want a different configuration than you default one
* Feature: The java file generation now ignores duplicate keys. The first one is included in the file, following ones are not but logged to console.out

### 2.1.0
* Feature: Added confirmation of destructive actions, like reloading the files while having unsaved edits or saving while the data loaded is not in sync with the disc. If you do not want confirmations set **noConfirmDestructiveLoad** to true
* Bumped Electron to the 3.x.x branch

### 2.0.1
* Fix: Missing focus when editing a phrase
* Fix: The application is now strict when parsing the json settings file

### 2.0.0
* Feature: Autogenerate key from selected locale using a fixed namespace. Check the **keyGenerator** settings
* Removed: Surprises are now dropped. It was a silly idea.
* Feature: Version number is now displayed in the menu list under Misc. Developer tools has also moved here from Application
* **Breaking change**: Rearranged and grouped the settings. Please consult the list above to see what changes you need to do.

### 1.6.4
* Fix: Java class generator factory
* Fix/featurett: Now allows saving untouched data for easy regeneration of files on disk
