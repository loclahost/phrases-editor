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


	let settings = settingsHandler.getSettings();
	var javaGeneratorSettings = settings.javaGenerator;
	if (!javaGeneratorSettings) {
		return;
	}
	let factory = javaGeneratorSettings.javaFactory || defaultFactory;
	console.log("Using java factory '" + factory + "'.");
	factories[factory].createJavaContent(fileContent, directory, javaGeneratorSettings)
		.then(content => fs.writeFile(path.resolve(directory, 'Translation.java'), content))
		.then(() => console.log('Done writing java translations'));


}
module.exports.generateJavaConstants = generateJavaConstants;
