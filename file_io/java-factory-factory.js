const path = require('path');
const fs = require('fs-extra');
const settingsHandler = require('../settings/settings-handler.js');
const javaEnumFactory = require('./java-enum-factory.js');
const javaClassFactory = require('./java-class-factory.js');

const factories = {
	'enum': javaEnumFactory,
	'class': javaClassFactory
};
const defaultFactory = 'enum';

function generateJavaConstants(fileContent, directory) {
	settingsHandler.get().then(settings => {
		if (!settings.generateJavaEnum) {
			return;
		}
		let factory = settings.javaFactory || defaultFactory;
		console.log("Using java factory '" + factory + "'. Settings set to '" + settings.javaFactory + "'");
		factories[factory].createJavaContent(fileContent, directory)
			.then(content => fs.writeFile(path.resolve(directory, 'Translation.java'), content))
			.then(() => console.log('Done writing java translations'));

	});
}
module.exports.generateJavaConstants = generateJavaConstants;