const dataStorage = require('../file_io/datastorage.js');
const ui = require('./table-ui.js');
const settingsHandler = require('../settings/settings-handler.js');
const ipcRenderer = require('electron').ipcRenderer;

function saveAndRerenderIfDirty() {
	if (dataStorage.isDirty()) {
		dataStorage.save();
		ui.renderData();
	}
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

function loadDirectory(directory) {
	$('#renderArea').html('<div class="container"><p>Loading phrases from ' + directory + '</p></div>');
	dataStorage.load(directory);
	$('button').prop("disabled", false);
	ui.renderData();
}

function initateControls() {
	let loadData = function(event) {
		delayButtonRepeatClick($(this), loadData, event);
		let dialog = require('electron').remote.dialog;
		let fileNames = dialog.showOpenDialog({ properties: ['openDirectory'] });
		if (fileNames && fileNames.length) {
			loadDirectory(fileNames[0]);
			settingsHandler.update({ lastOpenDirectory: fileNames[0] }, 'user');
		};
	};
	$('#loadData').click(loadData);

	let saveData = function(event) {
		delayButtonRepeatClick($(this), saveData, event);
		saveAndRerenderIfDirty();
	};
	$('#saveData').click(saveData);

	let reloadData = function(event) {
		delayButtonRepeatClick($(this), reloadData, event);
		dataStorage.load();
		ui.renderData();
	}
	$('#reloadData').click(reloadData);

	let createNew = function(event) {
		delayButtonRepeatClick($(this), createNew, event);
		ui.addRow();
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

ipcRenderer.on('file-save', function(event, message) {
	saveAndRerenderIfDirty();
});

module.exports.loadDirectory = loadDirectory;
module.exports.initateControls = initateControls;