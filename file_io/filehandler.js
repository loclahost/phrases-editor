const watch = require('node-watch');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const javaEnumFactory = require('./java-enum-factory.js');
const settingsHandler = require('../settings/settings-handler.js');
const notificationUI = require('../ui/notification-ui.js');

let fileWatch;
let notificationId;

function loadData(directory) {
	console.log('Loading files from ' + directory);

	let phrasesData = {
		meta: [],
		fileContent: []
	};

	if (!fs.existsSync(directory)) {
		return phrasesData;
	}

	if (fileWatch) {
		fileWatch.close();
	}

	notificationUI.clearNotifications();

	let files = fs.readdirSync(directory);

	files = files.filter((element) => element.endsWith('.phrases'));

	let contentMap = {};
	for (let index = 0; index < files.length; index++) {
		let meta = {
			name: files[index],
			path: path.resolve(directory, files[index])
		};

		phrasesData.meta.push(meta);

		let content = fs.readFileSync(phrasesData.meta[index].path, 'utf8');
		meta.md5 = createMD5(content);
		content = content.replace('\r', '');
		let lines = content.split('\n');
		for (let i = 0; i < lines.length; i++) {
			let phraseData = lines[i].split('~');
			let key = phraseData[0] + '~' + phraseData[1];
			let data = contentMap[key] || [key];
			data[index + 1] = phraseData[2];
			contentMap[key] = data;
		}
	}

	for (key in contentMap) {
		phrasesData.fileContent.push({
			content: contentMap[key],
			removed: false
		});
	}


	fileWatch = watch(directory, { recursive: true }, function(event, filename) {
		if (filename.endsWith('.phrases') && path.dirname(filename) == directory) {
			let changedMeta;
			for (let i = 0; i < phrasesData.meta.length; i++) {
				if (phrasesData.meta[i].path == filename) {
					changedMeta = phrasesData.meta[i];
				}
			}

			let originalMD5 = changedMeta.md5;
			if (originalMD5) {
				fs.readFile(filename, 'utf8', function(err, data) {
					if (err) {
						throw err;
					}

					if (changedMeta.notificationId) {
						notificationUI.removeNotification(changedMeta.notificationId);
					}

					if (createMD5(data) != originalMD5) {
						changedMeta.notificationId = notificationUI.createNotification("The file '" + filename + "' has changed on disk", 'warning');
					}
				});
			}
		}
	});

	return phrasesData;
}

function saveData(phrases, directory) {
	console.log("Saving data");

	let meta = phrases.getMeta();
	let content = phrases.getContent();
	content = content
		.filter((element) => !element.removed)
		.filter((element) => !!element.content[0])
		.sort((a, b) => a.content[0].localeCompare(b.content[0], 'sv'));

	let fileContent = content.map((element) => element.content);

	for (let i = 0; i < meta.length; i++) {
		let newContent = createPhrasesFileContents(fileContent, i + 1);
		meta[i].md5 = createMD5(newContent);
		fs.writeFile(meta[i].path, newContent, function() { console.log('Done writing ' + meta[i].path) });
	}

	settingsHandler.get().then(settings => {
		if (settings.generateJavaEnum) {
			javaEnumFactory.createJavaContent(fileContent, directory).then(content => fs.writeFile(path.resolve(directory, 'Translation.java'), content, function() { console.log('Done writing java translations') }));
		}
	});

	function createPhrasesFileContents(content, index) {
		let fileContentArray = [];
		for (let i = 0; i < content.length; i++) {
			let keyMapping = content[i][index];
			if (keyMapping) {
				fileContentArray.push(content[i][0] + '~' + keyMapping);
			}
		}

		return fileContentArray.join('\n');
	}

	return content;
}

function createMD5(fileContent) {
	return crypto.createHash('md5').update(fileContent).digest("hex");
}

module.exports.loadData = loadData;
module.exports.saveData = saveData;