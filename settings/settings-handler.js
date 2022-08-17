const app = require('@electron/remote').app;
const fs = require('fs-extra');
const path = require('path');
const extend = require('extend');
const ipcRenderer = require('electron').ipcRenderer;
const shell = require('electron').shell;

const USER_SETTINGS_PATH = path.join(app.getPath('userData'), 'phrases-editor-settings.json');

app.phrasesConfig = {

};

function load(path) {
	console.log('Reading settings from ' + path);
	return fs.readJsonSync(path);
}

function loadSettings() {
	app.phrasesConfig = {
		userSettings: {},
		projectSettings: {},
		settings: {}
	};

	if (fs.existsSync(USER_SETTINGS_PATH)) {
		let userSettings = load(USER_SETTINGS_PATH);
		app.phrasesConfig.userSettings = userSettings;
		if (userSettings.lastOpenDirectory) {
			let projectSettingsPath = path.join(userSettings.lastOpenDirectory, 'phrases-editor-settings.json');
			if (fs.existsSync(projectSettingsPath)) {
				app.phrasesConfig.projectSettings = load(projectSettingsPath);
			}
		}

		app.phrasesConfig.settings = extend({}, app.phrasesConfig.userSettings, app.phrasesConfig.projectSettings);
	}

}

function updateSettings(newSettings) {
	fs.writeJSONSync(USER_SETTINGS_PATH, extend({}, app.phrasesConfig.userSettings, newSettings));
	loadSettings();
}

if (!app.phrasesConfig.settings) {
	loadSettings();
}

ipcRenderer.on('window-command', function (event, message) {
	if (message == 'open_settings') {
		shell.openItem(USER_SETTINGS_PATH);
	}
});

module.exports = {
	getSettings: () => app.phrasesConfig.settings,
	updateSettings: updateSettings,
	reloadSettings: loadSettings
};
