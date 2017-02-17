const javaEnumFactory = require('./java_enum_factory.js');

function loadData(directory) {
	let path = require('path');
	let fs = require('fs');

	console.log('Loading files from ' + directory);

	let phrasesData = {
		meta : [],
		fileContent : []
	};

	let files = fs.readdirSync(directory);

	files = files.filter((element) => element.endsWith('.phrases'));

	let contentMap = {};
	for(let index = 0; index < files.length; index++) {
		phrasesData.meta.push({
			name : files[index],
			path : path.resolve(directory, files[index])
		});

		let content = fs.readFileSync(phrasesData.meta[index].path, 'utf8');
		content = content.replace('\r', '');
		let lines = content.split('\n');
		for(let i = 0; i < lines.length; i++) {
			let phraseData = lines[i].split('~');
			let key = phraseData[0] + '~' + phraseData[1];
			let data = contentMap[key] || [key];
			data[index + 1] = phraseData[2];
			contentMap[key] = data;
		}
	}

	for(key in contentMap) {
		phrasesData.fileContent.push({
			content : contentMap[key],
			removed : false
		});
	}

	alert('Done loading files');
	return phrasesData;
}

function saveData(phrases, directory) {
	console.log("Saving data");

	let path = require('path');
	let fs = require('fs');

	let meta = phrases.getMeta();
	let content = phrases.getContent();
	content = content
			.filter((element) => !element.removed)
			.sort((a, b) => a.content[0].localeCompare(b.content[0]));

	let fileContent = content.map((element) => element.content);

	for(let i = 0; i < meta.length; i++) {
		fs.writeFile(meta[i].path, createPhrasesFileContents(fileContent, i + 1), function() {console.log('Done writing ' + meta[i].path)});
	}

	fs.writeFile(path.resolve(directory,'Translation.java'), javaEnumFactory.createJavaContent(fileContent), function() {console.log('Done writing java translations')});

	function createPhrasesFileContents(content, index) {
		let fileContentArray = [];
		for(let i = 0; i < content.length; i++) {
			let keyMapping = content[i][index];
			if(keyMapping) {
				fileContentArray.push(content[i][0] + '~' + keyMapping);
			}
		}

		return fileContentArray.join('\n');
	}

	return content;
}

module.exports.loadData = loadData;
module.exports.saveData = saveData;