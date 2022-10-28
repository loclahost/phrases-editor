const electron = require('electron');
const electronRemote = require('@electron/remote/main');
const app = electron.app;
const dialog = electron.dialog;
const BrowserWindow = electron.BrowserWindow;
const Menu = electron.Menu;
let mainWindow;

function createNewWindow() {
	mainWindow = new BrowserWindow({
		width: 1200,
		height: 600,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
			enableRemoteModule: true,
		},
	});

	electronRemote.initialize();
	electronRemote.enable(mainWindow.webContents);

	mainWindow.loadURL('file://' + __dirname + '/index.html');

	mainWindow.on('close', (e) => {
		if (app.showExitPrompt) {
			e.preventDefault();

			dialog.showMessageBox(
				{
					type: 'question',
					buttons: ['Yes', 'No'],
					title: 'Confirm',
					message: 'Unsaved data will be lost. Are you sure you want to quit?',
				},
				function (response) {
					if (response === 0) {
						app.showExitPrompt = false;
						mainWindow.close();
					}
				}
			);
		}
	});

	mainWindow.on('closed', function () {
		mainWindow = null;
	});

	var template = [
		{
			label: 'Application',
			submenu: [
				{
					label: 'Open',
					accelerator: 'CmdOrCtrl+O',
					selector: 'open:',
					click: function () {
						mainWindow.webContents.send('window-command', 'open');
					},
				},
				{
					label: 'Reload',
					accelerator: 'CmdOrCtrl+R',
					selector: 'reload:',
					click: function () {
						mainWindow.webContents.send('window-command', 'reload');
					},
				},
				{
					label: 'Save',
					accelerator: 'CmdOrCtrl+S',
					selector: 'save:',
					click: function () {
						mainWindow.webContents.send('window-command', 'save');
					},
				},
				{
					label: 'New phrase',
					accelerator: 'CmdOrCtrl+N',
					selector: 'new:',
					click: function () {
						mainWindow.webContents.send('window-command', 'new');
					},
				},
				{ type: 'separator' },
				{
					label: 'Hide',
					accelerator: 'Command+H',
					click: function () {
						app.hide();
					},
				},
				{
					label: 'Quit',
					accelerator: 'CmdOrCtrl+Q',
					click: function () {
						app.quit();
					},
				},
			],
		},
		{
			label: 'Edit',
			submenu: [
				{
					label: 'Find',
					accelerator: 'CmdOrCtrl+F',
					selector: 'find:',
					click: function () {
						mainWindow.webContents.send('window-command', 'find');
					},
				},
				{ type: 'separator' },
				{ label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
				{ label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
				{ type: 'separator' },
				{ label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
				{ label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
				{ label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
				{ label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' },
			],
		},
		{
			label: 'Misc',
			submenu: [
				{
					label: 'Settings',
					selector: 'settings:',
					click: function () {
						mainWindow.webContents.send('window-command', 'open_settings');
					},
				},
				{
					label: 'Toggle Developer Tools',
					accelerator: 'Alt+Command+I',
					click: function () {
						mainWindow.toggleDevTools();
					},
				},
				{
					label: 'Version: ' + app.getVersion(),
				},
			],
		},
	];

	Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.on('ready', function () {
	createNewWindow();
});

app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', function () {
	if (mainWindow === null) {
		createNewWindow();
	} else {
		app.show();
	}
});

app.showExitPrompt = false;
