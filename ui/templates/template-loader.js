let templates = {};

function getTemplate(templateName) {
	if(templates[templateName]) {
		return templates[templateName];
	}

	let path = require('path');
	let fs = require('fs');
	templates[templateName] = fs.readFileSync(path.join(__dirname, templateName + ".mustache"), "utf8");

	return templates[templateName];
}

module.exports.getTemplate = getTemplate;