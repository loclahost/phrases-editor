const path = require('path');
const fs = require('fs');

let uiTemplates = {};
let javaTemplates = {};

function getUITemplate(templateName) {
	if (uiTemplates[templateName]) {
		return uiTemplates[templateName];
	}

	uiTemplates[templateName] = fs.readFileSync(path.join(__dirname, "ui", templateName + ".mustache"), "utf8");

	return uiTemplates[templateName];
}

function getJavaTemplate(templateName) {
	if (javaTemplates[templateName]) {
		return javaTemplates[templateName];
	}

	javaTemplates[templateName] = fs.readFileSync(path.join(__dirname, "java", templateName + ".mustache"), "utf8");

	return javaTemplates[templateName];
}

module.exports.getUITemplate = getUITemplate;
module.exports.getJavaTemplate = getJavaTemplate;