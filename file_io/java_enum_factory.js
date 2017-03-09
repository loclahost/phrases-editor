function createJavaContent(phrasesArray) {
	let content = "package se.netset.etailer;\n\npublic class Translation {\n";
	let currentNamespace = '';
	let currentKeys = [];
	for(let i = 0; i < phrasesArray.length; i++) {
		let phraseKey = phrasesArray[i][0].split('~');
		if(phraseKey[0] != currentNamespace) {
			if(currentNamespace != '') {
				content += '\t\t' + currentKeys.join(',\n\t\t') + ';\n';
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
	return "\tpublic enum " + createValidEnumName(rawNamespace) + " implements se.netset.etailer.EnumTranslation {\n";
}

function createEnumConstant(key) {
	return createValidEnumName(key) + '("' + key.replace(/"/g, '\\"') + '")';
}

function createEnumEnd(rawNamespace) {
	let namespace = createValidEnumName(rawNamespace);

	let javaEnum = '\t\tprivate String key;\n';
	javaEnum += '\t\tprivate final static String namespace = "' + namespace + '";\n\n';

	javaEnum += '\t\tprivate ' + namespace + '(String key) {\n';
	javaEnum += '\t\t\tthis.key = key;\n';
	javaEnum += '\t\t}\n\n';

	javaEnum += '\t\t@Override\n';
	javaEnum += '\t\tpublic String getTranslation(se.netset.i18n3.Locale loc) {\n';
	javaEnum += '\t\t\treturn loc.translate(key, namespace);\n';
	javaEnum += '\t\t}\n\n';

	javaEnum += '\t\t@Override\n';
	javaEnum += '\t\tpublic String toString() {\n';
	javaEnum += '\t\t\treturn getTranslation(se.netset.i18n3.I18nComp.getLocaleService().getCurrentLocale());\n';
	javaEnum += '\t\t}\n\n';

	javaEnum += "\t}\n\n";

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