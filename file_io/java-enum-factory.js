const javaUtil = require('./java-util.js');
const path = require('path');

function createJavaContent(phrasesArray, currentPath, settings) {
	function createJavaEnums() {
		let content = 'package ' + javaUtil.guessPackageName(currentPath, settings) + ';\n\npublic class Translation {\n';
		let currentNamespace = '';
		let currentKeys = [];
		let duplicatesMap = {};
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
				duplicatesMap = {};
			}
			let constantName = javaUtil.createValidEnumName(phraseKey[1]);
			let enumInstanceDeclaration = createEnumConstant(phraseKey[1]);
			if (duplicatesMap[constantName]) {
				console.log('Ignoring ' + enumInstanceDeclaration + '; it is a duplicate');
			} else {
				currentKeys.push(createEnumConstant(phraseKey[1]));
				duplicatesMap[constantName] = true;
			}
		}
		if (currentNamespace != '') {
			content += '\t\t' + currentKeys.join(',\n\t\t') + ';\n\n';
			content += createEnumEnd(currentNamespace);
		}
		content += '}\n';
		return content;
	}

	function createEnumStart(rawNamespace) {
		return '\tpublic enum ' + javaUtil.createValidEnumName(rawNamespace) + ' implements ' + settings.translationInterface + ' {\n';
	}

	function createEnumConstant(key) {
		return javaUtil.createValidEnumName(key) + '("' + key.replace(/"/g, '\\"') + '")';
	}

	function createEnumEnd(rawNamespace) {
		let namespace = javaUtil.createValidEnumName(rawNamespace);

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

		javaEnum += '\t}\n\n';

		return javaEnum;
	}

	return new Promise((resolve, reject) => resolve(createJavaEnums()));
}

module.exports.createJavaContent = createJavaContent;
