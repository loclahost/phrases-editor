const dataStorage = require('../file_io/datastorage.js');
const ui = require('./table-ui.js');
const settingsHandler = require('../settings/settings-handler.js');
const ipcRenderer = require('electron').ipcRenderer;
const dialog = require('@electron/remote').dialog;

function confirmDestructiveLoad() {
	return confirmDestructiveAction('load', 'Unsaved data will be lost. Are you sure you want to continue?');
}

function confirmDestructiveSave() {
	return confirmDestructiveAction('save', 'You are not in sync with the sources files. Are you sure you want to save?');
}

function confirmDestructiveAction(type, dialogText) {
	return new Promise((resolve, reject) => {
		isConfirmationNeeded(type).then((confirmationNeeded) => {
			if (confirmationNeeded) {
				dialog.showMessageBox(
					{
						type: 'question',
						buttons: ['Yes', 'No'],
						title: 'Confirm',
						message: dialogText,
					},
					function (response) {
						if (response === 0) {
							resolve();
						} else {
							reject();
						}
					}
				);
			} else {
				resolve();
			}
		});
	});
}

function saveAndRerender() {
	confirmDestructiveSave()
		.then(() => dataStorage.save())
		.then(() => ui.renderData());
}

function choseDirectoryAndLoadData() {
	confirmDestructiveLoad().then(() => {
		dialog.showOpenDialog({ properties: ['openDirectory'] }).then(({ filePaths }) => {
			if (filePaths && filePaths.length) {
				console.log('Loading ' + filePaths);
				loadAndRender(filePaths[0]).then(() => {
					$('button').prop('disabled', false);
					settingsHandler.updateSettings({ lastOpenDirectory: filePaths[0] }, 'user');
				});
			}
		});
	});
}

function confirmableLoadAndRender(directory) {
	confirmDestructiveLoad().then(() => loadAndRender(directory));
}

function loadAndRender(directory) {
	ui.renderLoading();
	return dataStorage.load(directory).then(() => ui.renderData());
}

function createNewRow() {
	ui.addRow();
}

function focusOnFilter() {
	$('.navbar .search').focus();
}

function delayButtonRepeatClick(button, clickFunction, event) {
	let disabledState = button.prop('disabled');
	button.prop('disabled', 'disabled');
	button.off('click');
	window.setTimeout(function () {
		button.click(clickFunction);
		button.prop('disabled', disabledState);
	}, 1000);
	event.stopPropagation();
}

function initateControls() {
	let loadData = function (event) {
		delayButtonRepeatClick($(this), loadData, event);
		choseDirectoryAndLoadData();
	};
	$('#loadData').click(loadData);

	let saveData = function (event) {
		delayButtonRepeatClick($(this), saveData, event);
		saveAndRerender();
	};
	$('#saveData').click(saveData);

	let reloadData = function (event) {
		delayButtonRepeatClick($(this), reloadData, event);
		confirmableLoadAndRender();
	};
	$('#reloadData').click(reloadData);

	let createNew = function (event) {
		delayButtonRepeatClick($(this), createNew, event);
		createNewRow();
	};
	$('#createNew').click(createNew);

	let settings = settingsHandler.getSettings();
	let searchTimerId;
	$('input.search').keydown(function (event) {
		if (event.keyCode == 13) {
			if (settings.filterOnEnter) {
				ui.filterForSearch();
			}
			return false;
		}
	});
	if (!settings.filterOnEnter) {
		$('input.search').on('input', function () {
			clearTimeout(searchTimerId);
			searchTimerId = window.setTimeout(ui.filterForSearch, 300);
		});
	}
}

function isConfirmationNeeded(type) {
	let settings = settingsHandler.getSettings();
	return new Promise((resolve, reject) => {
		let loadNeeded = settings && !settings.noConfirmDestructiveLoad;
		if (type == 'load') {
			loadNeeded &= dataStorage.isDirty();
		} else {
			loadNeeded &= !dataStorage.isInSync();
		}
		resolve(loadNeeded);
	});
}

ipcRenderer.on('window-command', function (event, message) {
	switch (message) {
		case 'open':
			choseDirectoryAndLoadData();
			break;
		case 'reload':
			confirmableLoadAndRender();
			break;
		case 'save':
			saveAndRerender();
			break;
		case 'new':
			createNewRow();
			break;
		case 'find':
			focusOnFilter();
			break;
	}
});

module.exports.loadDirectory = loadAndRender;
module.exports.initateControls = initateControls;
