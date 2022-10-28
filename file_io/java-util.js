const path = require('path');

function createValidEnumName(name) {
	return name.replace(/^\d|\W+/gm, '_').toUpperCase();
}

function createJavaKey(phraseKey) {
	if (!phraseKey) {
		return '';
	}
	let keyParts = phraseKey.split('~');
	return createValidEnumName(keyParts[0]) + '.' + createValidEnumName(keyParts[1]);
}

function guessPackageName(currentPath, settings) {
	let rootFound = false;
	let pathElements = currentPath.split(path.sep);
	let packageElements = [];
	for (let i = 0; i < pathElements.length; i++) {
		if (rootFound) {
			packageElements.push(createValidPackageName(pathElements[i]));
		} else if (settings.srcRoots.indexOf(pathElements[i]) != -1) {
			rootFound = true;
		}
	}

	return packageElements.join('.');
}

function createValidPackageName(name) {
	if (/^\d/.test(name)) {
		name = '_' + name;
	}
	if (name.indexOf('-') != -1) {
		name = name.replace('-', '_');
	}

	name = name.toLowerCase();

	return name;
}

module.exports.createJavaKey = createJavaKey;
module.exports.createValidEnumName = createValidEnumName;
module.exports.guessPackageName = guessPackageName;
