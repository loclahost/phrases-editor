const app = require('electron').remote.app;
const fs = require('fs');
const path = require('path');
const extend = require('extend');
const ipcRenderer = require('electron').ipcRenderer;
const shell = require('electron').shell;

const USER_SETTINGS_PATH = path.join(app.getPath('userData'), 'phrases-editor-settings.json');
const SYSTEM_SETTINGS_PATH = path.join(__dirname, "settings.json");

function load(path) {
	console.log('Reading settings from ' + path);
	return new Promise((resolve, reject) => {
		fs.readFile(path, 'utf-8', (err, obj) => {
			if (err) {
				resolve({});
			} else {
				resolve(JSON.parse(obj));
			}
		});
	});
}

function getSettings() {
	return new Promise((resolve, reject) => {
		let settingPromises = [];
		settingPromises.push(load(SYSTEM_SETTINGS_PATH));
		settingPromises.push(load(USER_SETTINGS_PATH));

		Promise.all(settingPromises).then(values => {
			let mergedSettings = {};
			for (let i = 0; i < values.length; i++) {
				mergedSettings = extend(mergedSettings, values[i]);
			}
			console.log(mergedSettings);
			resolve(mergedSettings);
		}).catch(err => {
			reject(err);
		});
	});
}

function updateSettings(newSettings, path) {
	load(path)
		.then(oldSettings => extend(oldSettings, newSettings))
		.then(mergedSettings => fs.writeFile(path, JSON.stringify(mergedSettings), (err) => {
			if (err) {
				console.error(err);
			}
		}));

	global[SETTINGS_KEY] = new Promise((resolve, reject) => resolve(extend(global[SETTINGS_KEY], newSettings)));
}

///////////////////////////// Settings singleton //////////////////////////////
const SETTINGS_KEY = Symbol.for("phrases-editor.settings");


var globalSymbols = Object.getOwnPropertySymbols(global);
var hasSettings = (globalSymbols.indexOf(SETTINGS_KEY) > -1);


if (!hasSettings) {
	global[SETTINGS_KEY] = getSettings();
}

var singleton = {
	get: function() {
		return global[SETTINGS_KEY];
	},
	update: function(settings, type) {
		if (type == 'user') {
			updateSettings(settings, USER_SETTINGS_PATH);
		} else {
			updateSettings(settings, SYSTEM_SETTINGS_PATH);
		}
	}
};


ipcRenderer.on('window-command', function(event, message) {
	if (message == 'open_settings') {
		shell.openItem(USER_SETTINGS_PATH);
	}
});

module.exports = singleton;