function createJavaContent(phrasesArray) {
	let content = "package se.netset.etailer;\n\npublic class Translation {\n";
	let currentNamespace = '';
	let currentKeys = [];
	for(let i = 0; i < phrasesArray.length; i++) {
		let phraseKey = phrasesArray[i][0].split('~');
		if(phraseKey[0] != currentNamespace) {
			if(currentNamespace != '') {
				content += currentKeys.join(',\n') + ';\n';
				content += createEnumEnd(currentNamespace);
			}
			currentNamespace = phraseKey[0];
			content += createEnumStart(currentNamespace);
			currentKeys = [];
		}

		currentKeys.push(createEnumConstant(phraseKey[1]));
	}
	if(currentNamespace != '') {
		content += currentKeys.join(',\n') + ';\n';
		content += createEnumEnd(currentNamespace);
	}
	content += "}\n";
	return content;
}

function createEnumStart(rawNamespace) {
	return "public enum " + createValidEnumName(rawNamespace) + " implements se.netset.etailer.EnumTranslation {\n";
}

function createEnumConstant(key) {
	return createValidEnumName(key) + '("' + key.replace(/"/g, '\\"') + '")';
}

function createEnumEnd(rawNamespace) {
	let namespace = createValidEnumName(rawNamespace);

	let javaEnum = 'private String key;\n';
	javaEnum += 'private final static String namespace = "' + namespace + '";\n\n';

	javaEnum += 'private ' + namespace + '(String key) {\n';
	javaEnum += 'this.key = key;\n';
	javaEnum += '}\n\n';

	javaEnum += '@Override\n';
	javaEnum += 'public String getTranslation(se.netset.i18n3.Locale loc) {\n';
	javaEnum += 'return loc.translate(key, namespace);\n';
	javaEnum += '}\n\n';

	javaEnum += '@Override\n';
	javaEnum += 'public String toString() {\n';
	javaEnum += 'return getTranslation(se.netset.i18n3.I18nComp.getLocaleService().getCurrentLocale());\n';
	javaEnum += '}\n\n';

	javaEnum += "}\n\n";

	return javaEnum;
}

function createValidEnumName(name) {
	return name.replace(/^\d|\W+/gm, "_").toUpperCase();
}

function createJavaKey(phraseKey) {
	if(!phraseKey) {
		return "";
	}
	let keyParts = phraseKey.split('~');
	return createValidEnumName(keyParts[0]) + "." + createValidEnumName(keyParts[1]);
}

module.exports.createJavaContent = createJavaContent;
module.exports.createJavaKey = createJavaKey;