const settingsHandler = require('../settings/settings-handler.js');
const javaUtil = require("./java-util.js");
const path = require('path');
const templateLoader = require('../templates/template-loader.js');
const Mustache = require('mustache');

function createJavaContent(phrasesArray, currentPath) {
	return settingsHandler.get().then(settings => {
		function createJavaEnums() {
			let namespaces = {};
			phrasesArray.forEach((phrase) => {
				let keyValueArray = phrase[0].split('~');
				if (!namespaces[keyValueArray[0]]) {
					namespaces[keyValueArray[0]] = [];
				}
				namespaces[keyValueArray[0]].push(keyValueArray[1]);
			});

			let context = createWrapperClass(namespaces);

			return Mustache.render(templateLoader.getJavaTemplate('class-wrapper'), context, {
				'namespace-class': templateLoader.getJavaTemplate('namespace-class')
			});
		}

		function createWrapperClass(namespaces) {
			return {
				translationInterface: settings.translationInterface,
				localeInterface: settings.localeInterface,
				localeService: settings.localeService,
				packageName: javaUtil.guessPackageName(currentPath, settings),
				namespaceClasses: Object.keys(namespaces).map(key => createNamespaceClass(key, namespaces[key]))
			};
		}

		function createNamespaceClass(namespace, keys) {
			return {
				namespace: namespace,
				initFunctions: createInitFunctions(keys)
			};
		}

		function createInitFunctions(keys) {
			let initFunctionMap = {};
			keys
				.map(key => {
					return { constantName: javaUtil.createValidEnumName(key), constantKey: key };
				})
				.forEach((value, index) => {
					let functionName = "init" + Math.floor(index / 500);
					if (!initFunctionMap[functionName]) {
						initFunctionMap[functionName] = { functionName: functionName, phraseConstants: [] };
					}
					initFunctionMap[functionName].phraseConstants.push(value);
				});
			return Object.keys(initFunctionMap).map(key => initFunctionMap[key]);
		}

		return new Promise((resolve, reject) => resolve(createJavaEnums()));
	});
}

module.exports.createJavaContent = createJavaContent;