const settingsHandler = require('../settings/settings-handler.js');
const path = require('path');

function createJavaContent(phrasesArray, currentPath) {
	return settingsHandler.get().then(settings => {
		function createJavaEnums() {
			let content = 'package ' + guessPackageName() + ';\n\npublic class Translation {\n';
			let currentNamespace = '';
			let currentKeys = [];
			for (let i = 0; i < phrasesArray.length; i++) {
				let phraseKey = phrasesArray[i][0].split('~');
				if (phraseKey[0] != currentNamespace) {
					if (currentNamespace != '') {
						content += '\t\t' + currentKeys.join(',\n\t\t') + ';\n\n';
						content += createEnumEnd(currentNamespace);
					}
					currentNamespace = phraseKey[0];
					content += createEnumStart(currentNamespace);
					currentKeys = [];
				}

				currentKeys.push(createEnumConstant(phraseKey[1]));
			}
			if (currentNamespace != '') {
				content += '\t\t' + currentKeys.join(',\n\t\t') + ';\n\n';
				content += createEnumEnd(currentNamespace);
			}
			content += "}\n";
			return content;
		}

		function createEnumStart(rawNamespace) {
			return "\tpublic enum " + createValidEnumName(rawNamespace) + " implements " + settings.translationInterface + " {\n";
		}

		function createEnumConstant(key) {
			return createValidEnumName(key) + '("' + key.replace(/"/g, '\\"') + '")';
		}

		function createEnumEnd(rawNamespace) {
			let namespace = createValidEnumName(rawNamespace);

			let javaEnum = '\t\tprivate String key;\n';
			javaEnum += '\t\tprivate static final String namespace = "' + rawNamespace + '";\n\n';

			javaEnum += '\t\tprivate ' + namespace + '(String key) {\n';
			javaEnum += '\t\t\tthis.key = key;\n';
			javaEnum += '\t\t}\n\n';

			javaEnum += '\t\t@Override\n';
			javaEnum += '\t\tpublic String getTranslation(' + settings.localeInterface + ' loc) {\n';
			javaEnum += '\t\t\treturn loc.translate(key, namespace);\n';
			javaEnum += '\t\t}\n\n';

			javaEnum += '\t\t@Override\n';
			javaEnum += '\t\tpublic String toString() {\n';
			javaEnum += '\t\t\treturn getTranslation(' + settings.localeService + '.getCurrentLocale());\n';
			javaEnum += '\t\t}\n\n';

			javaEnum += "\t}\n\n";

			return javaEnum;
		}

		function guessPackageName() {
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

		return new Promise((resolve, reject) => resolve(createJavaEnums()));
	});
}

function createValidEnumName(name) {
	return name.replace(/^\d|\W+/gm, "_").toUpperCase();
}

function createJavaKey(phraseKey) {
	if (!phraseKey) {
		return "";
	}
	let keyParts = phraseKey.split('~');
	return createValidEnumName(keyParts[0]) + "." + createValidEnumName(keyParts[1]);
}

module.exports.createJavaContent = createJavaContent;
module.exports.createJavaKey = createJavaKey;