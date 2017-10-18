const path = require('path');
const fs = require('fs');

let templates = {};

function getTemplate(templateName) {
	if (templates[templateName]) {
		return templates[templateName];
	}

	templates[templateName] = fs.readFileSync(path.join(__dirname, templateName + ".mustache"), "utf8");

	return templates[templateName];
}

module.exports.getTemplate = getTemplate;