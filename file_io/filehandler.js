const watch = require('node-watch');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs-extra');
const javaFactoryFactory = require('./java-factory-factory.js');
const settingsHandler = require('../settings/settings-handler.js');
const notificationUI = require('../ui/notification-ui.js');

let fileWatch;
let notificationId;

var getFilePromise = function(meta, index) {
	return fs.readFile(meta.path, 'utf8')
		.then(content => {
			meta.md5 = createMD5(content);
			content = content.replace('\r', '');
			console.log("Read file " + meta.path);
			return content.split('\n');
		});
};

function loadData(directory) {
	console.log('Loading files from ' + directory);

	let phrasesData = {
		meta: [],
		fileContent: []
	};

	if (!fs.existsSync(directory)) {
		return phrasesData;
	}

	watchDirectory(directory, phrasesData);

	notificationUI.clearNotifications();

	let files = fs.readdirSync(directory);

	files = files.filter((element) => element.endsWith('.phrases'));

	let promises = [];
	for (let index = 0; index < files.length; index++) {
		let meta = {
			name: files[index],
			path: path.resolve(directory, files[index])
		};

		phrasesData.meta.push(meta);

		promises.push(getFilePromise(meta, index));
	}

	return Promise.all(promises)
		.then(values => {
			let contentMap = {};
			values.forEach(function(lines, index) {
				lines.forEach(function(line) {
					let phraseData = line.split('~');
					let key = phraseData[0] + '~' + phraseData[1];
					let data = contentMap[key] || [key];
					data[index + 1] = phraseData[2];
					contentMap[key] = data;
				});
			});

			for (key in contentMap) {
				phrasesData.fileContent.push({
					content: contentMap[key],
					removed: false
				});
			}

			return phrasesData;
		})
		.catch(err => console.error(err));
}

function saveData(phrases, directory, sortType) {
	console.log("Saving data");

	let sortFunction;
	if (sortType == 'ascii') {
	    sortFunction = (a, b) => (a.content[0] > b.content[0]) - (a.content[0] < b.content[0]);
	} else {
	    sortFunction = (a, b) => a.content[0].localeCompare(b.content[0], 'sv');
	}

	let meta = phrases.getMeta();
	let content = phrases.getContent();
	content = content
		.filter((element) => !element.removed)
		.filter((element) => !!element.content[0])
		.sort(sortFunction);

	let fileContent = content.map((element) => element.content);

	for (let i = 0; i < meta.length; i++) {
		let newContent = createPhrasesFileContents(fileContent, i + 1);
		meta[i].md5 = createMD5(newContent);
		fs.writeFile(meta[i].path, newContent)
			.then(() => console.log('Done writing ' + meta[i].path));
	}

	javaFactoryFactory.generateJavaConstants(fileContent, directory);

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

function watchDirectory(directory, phrasesData) {
	if (fileWatch) {
		fileWatch.close();
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
				fs.readFile(filename, 'utf8')
					.then(data => {
						if (changedMeta.notificationId) {
							notificationUI.removeNotification(changedMeta.notificationId);
							delete changedMeta.notificationId;
						}

						if (createMD5(data) != originalMD5) {
							changedMeta.notificationId = notificationUI.createNotification("The file '" + filename + "' has changed on disk", 'warning');
						}
					})
					.catch(err => console.error(err));
			}
		}
	});
}

function createMD5(fileContent) {
	return crypto.createHash('md5').update(fileContent).digest("hex");
}

module.exports.loadData = loadData;
module.exports.saveData = saveData;
