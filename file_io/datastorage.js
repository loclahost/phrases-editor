const fileHandler = require('./filehandler.js');
const app = require('@electron/remote').app;

let directoryPath;
let phrasesData = (function () {
	let meta = [];
	let fileContent = {};
	let state = 'idle';
	let changeListeners = [];

	let addChangeListener = function (listener) {
		changeListeners.push(listener);
	};

	let getMeta = function () {
		return meta;
	};

	let setContent = function (newFileContent, newMeta) {
		fileContent = newFileContent;
		meta = newMeta;
	};

	let getContent = function () {
		return fileContent;
	};

	let addContentRow = function () {
		return fileContent.push({
			content: new Array(meta.length + 1),
			removed: false
		}) - 1;
	}

	let setContentRow = function (index, row) {
		fileContent[index].content = row;
	};

	let toggleRemoveContentRow = function (index) {
		fileContent[index].removed = !fileContent[index].removed;
	}

	let setState = function (newState) {
		state = newState;
		for (let i = 0; i < changeListeners.length; i++) {
			changeListeners[i]();
		}
		app.showExitPrompt = isDirty();
	};

	let isDirty = function () {
		return state == 'dirty';
	};

	let isInSync = function () {
		return meta
			.filter(element => element.notificationId)
			.length == 0;
	}

	let getState = function () {
		return state;
	}

	return {
		addChangeListener: addChangeListener,
		getMeta: getMeta,
		setContent: setContent,
		getContent: getContent,
		addContentRow: addContentRow,
		setContentRow: setContentRow,
		toggleRemoveContentRow: toggleRemoveContentRow,
		setState: setState,
		isDirty: isDirty,
		isInSync: isInSync,
		getState: getState
	};
}());


function getDirectoryPath() {
	return directoryPath;
}

function getPhrasesData() {
	return phrasesData;
}

function save() {
	let settings = settingsHandler.getSettings();
	phrasesData.setState('save');
	return fileHandler.saveData(phrasesData, directoryPath, settings.sortType)
		.then(savedPhrases => {
			phrasesData.setContent(savedPhrases, phrasesData.getMeta());
			phrasesData.setState('idle');
		});
}

function load(directory) {
	if (directory) {
		directoryPath = directory;
	}
	phrasesData.setState('load');
	return fileHandler.loadData(directoryPath)
		.then(newContent => {
			phrasesData.setContent(newContent.fileContent, newContent.meta);
			phrasesData.setState('idle');
		});
}

function getMetaIndexForLocale(locale) {
	return phrasesData.getMeta().findIndex(element => element.name == locale);
}

module.exports.getDirectoryPath = getDirectoryPath;
module.exports.getPhrasesData = getPhrasesData;
module.exports.save = save;
module.exports.load = load;
module.exports.isDirty = phrasesData.isDirty;
module.exports.isInSync = phrasesData.isInSync;
module.exports.getState = phrasesData.getState;
module.exports.getMetaIndexForLocale = getMetaIndexForLocale;
