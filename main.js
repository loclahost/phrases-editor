const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const Menu = electron.Menu;
let mainWindow;

function createNewWindow() {
	mainWindow = new BrowserWindow({width: 1200, height: 600});
	mainWindow.loadURL('file://' + __dirname + '/index.html');

	mainWindow.on('closed', function () {
		mainWindow = null;
	});

	var template = [
	{
		label: "Application",
		submenu: [
			{
				label: 'Toggle Developer Tools',
				accelerator: 'Alt+Command+I',
				click: function() { mainWindow.toggleDevTools(); }
			},
			{
				label: "Save",
				accelerator: "CmdOrCtrl+S",
				selector: "save:",
				click: function() {
					mainWindow.webContents.send('file-save', 'save-editor');
				}
			},
			{ label: "Hide", accelerator: "Command+H", click: function() { mainWindow.hide(); }},
			{ label: "Quit", accelerator: "Command+Q", click: function() { app.quit(); }}
		]
	}, {
		label: "Edit",
		submenu: [
			{ label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
			{ label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
			{ type: "separator" },
			{ label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
			{ label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
			{ label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
			{ label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
		]
	}
	];

	Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.on('ready', function() {
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
		mainWindow.show();
	}
});
