const app = require('electron').remote.app;
const fs = require('fs');
const path = require('path');
const extend = require('extend');

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
			for(let i = 0; i < values.length; i++) {
				mergedSettings = extend(mergedSettings, values[i]);
			}
			console.log(mergedSettings);
			resolve(mergedSettings);
		}).catch(err => {
			reject(err);
		});
	});
}

///////////////////////////// Settings singleton //////////////////////////////
const SETTINGS_KEY = Symbol.for("phrases-editor.settings");


var globalSymbols = Object.getOwnPropertySymbols(global);
var hasSettings = (globalSymbols.indexOf(SETTINGS_KEY) > -1);

if (!hasSettings){
  global[SETTINGS_KEY] = getSettings();
}

var singleton = {
	get: function() {
    	return global[SETTINGS_KEY];
  	}
};

module.exports = singleton;
