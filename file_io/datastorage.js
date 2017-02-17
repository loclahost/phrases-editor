const fileHandler = require('./filehandler.js');

let directoryPath;
let phrasesData = (function() {
	let meta = [];
	let fileContent = {};
	let dirty = false;
	let changeListeners = [];

	let addChangeListener = function(listener) {
		changeListeners.push(listener);
	};

	let getMeta =  function() {
		return meta;
	};

	let setContent = function(newFileContent, newMeta) {
		fileContent = newFileContent;
		meta = newMeta;
	};

	let getContent = function() {
		return fileContent;
	};

	let addContentRow = function() {
		return fileContent.push({
			content : new Array(meta.length + 1),
			removed : false
		}) - 1;
	}

	let setContentRow = function(index, row) {
		fileContent[index].content = row;
	};

	let toggleRemoveContentRow = function(index) {
		fileContent[index].removed = !fileContent[index].removed;
	}

	let setDirty = function(dirtyOrNot) {
		dirty = dirtyOrNot;
		for(let i = 0; i < changeListeners.length; i++) {
			changeListeners[i]();
		}
	};

	let isDirty = function() {
		return dirty;
	};

	return {
		addChangeListener : addChangeListener,
		getMeta : getMeta,
		setContent : setContent,
		getContent : getContent,
		addContentRow : addContentRow,
		setContentRow : setContentRow,
		toggleRemoveContentRow : toggleRemoveContentRow,
		setDirty : setDirty,
		isDirty : isDirty
	};
}());


function getDirectoryPath() {
	return directoryPath;
}

function getPhrasesData() {
	return phrasesData;
}

function save() {
	let savedPhrases = fileHandler.saveData(phrasesData, directoryPath);
	phrasesData.setContent(savedPhrases, phrasesData.getMeta());
	phrasesData.setDirty(false);
}

function load(directory) {
	if(directory) {
		directoryPath = directory;
	}
	let newContent = fileHandler.loadData(directoryPath);
	phrasesData.setContent(newContent.fileContent, newContent.meta);
	phrasesData.setDirty(false);
}

module.exports.getDirectoryPath = getDirectoryPath;
module.exports.getPhrasesData = getPhrasesData;
module.exports.save = save;
module.exports.load = load;
module.exports.isDirty = phrasesData.isDirty;