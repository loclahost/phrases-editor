const dataStorage = require('../file_io/datastorage.js');
const ui = require('./table-ui.js');
const settingsHandler = require('../settings/settings-handler.js');
const ipcRenderer = require('electron').ipcRenderer;

function saveAndRerender() {
	dataStorage.save();
	ui.renderData();
}

function choseDirectoryAndLoadData() {
	let dialog = require('electron').remote.dialog;
	let fileNames = dialog.showOpenDialog({ properties: ['openDirectory'] });
	if (fileNames && fileNames.length) {
		loadAndRender(fileNames[0])
			.then(() => {
				$('button').prop("disabled", false);
				settingsHandler.update({ lastOpenDirectory: fileNames[0] }, 'user');
			});
	};
}

function loadAndRender(directory) {
	return dataStorage.load(directory)
		.then(() => ui.renderData());
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
	window.setTimeout(function() {
		button.click(clickFunction);
		button.prop('disabled', disabledState);
	}, 1000);
	event.stopPropagation();
}

function initateControls() {
	let loadData = function(event) {
		delayButtonRepeatClick($(this), loadData, event);
		choseDirectoryAndLoadData();
	};
	$('#loadData').click(loadData);

	let saveData = function(event) {
		delayButtonRepeatClick($(this), saveData, event);
		saveAndRerender();
	};
	$('#saveData').click(saveData);

	let reloadData = function(event) {
		delayButtonRepeatClick($(this), reloadData, event);
		loadAndRender();
	}
	$('#reloadData').click(reloadData);

	let createNew = function(event) {
		delayButtonRepeatClick($(this), createNew, event);
		createNewRow();
	};
	$('#createNew').click(createNew);

	settingsHandler.get().then(settings => {
		let searchTimerId;
		$('input.search').keydown(function(event) {
			if (event.keyCode == 13) {
				if (settings.filterOnEnter) {
					ui.filterForSearch();
				}
				return false;
			}
		});
		if (!settings.filterOnEnter) {
			$('input.search').keyup(function() {
				clearTimeout(searchTimerId);
				searchTimerId = window.setTimeout(ui.filterForSearch, 300);
			});
		}
	});
}

ipcRenderer.on('window-command', function(event, message) {
	switch (message) {
		case 'open':
			choseDirectoryAndLoadData();
			break;
		case 'reload':
			loadAndRender();
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