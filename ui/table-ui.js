const dataStorage = require('../file_io/datastorage.js');
const templateLoader = require('./templates/template-loader.js');
const Mustache = require('mustache');
const javaEnumFactory = require('../file_io/java-enum-factory.js');
const clipboard = require('electron').remote.clipboard;

function renderData() {
	$('#renderArea').empty().append(createContexts());
	$('.content').click(function() {
		transformToForm($(this));
	});
	filterForSearch();
}

function filterForSearch() {
	var searchValue = $('input.search').val();
	var removeHighlightRegExp = new RegExp('<span class="matching-text">(.+)<\/span>', 'i');

	settingsHandler.get().then(settings => {
		if (searchValue && searchValue.length > 1) {
			var searchRegExp = new RegExp('(' + searchValue + ')', 'i');
			if (settings.highlightMatchedPhrase) {
				$('#renderArea .content').each(function() {
					var row = $(this);
					var matchedRow = false;
					$('.column span', row).each(function() {
						var span = $(this);
						span.text(span.html().replace(removeHighlightRegExp, '$1'));
						if (searchRegExp.test(span.text())) {
							matchedRow = true;
							span.html(span.text().replace(searchRegExp, '<span class="matching-text">$1</span>'));
						}
					});
					row.toggle(matchedRow);
				});
			} else {
				$('#renderArea .content').each(function() {
					var row = $(this);
					row.toggle(searchRegExp.test(row.text()));
				});
			}
		} else {
			if (settings.highlightMatchedPhrase) {
				$('#renderArea .content .column span').each(function() {
					var span = $(this);
					span.text(span.html().replace(removeHighlightRegExp, '$1'));
				});
			}
			$('#renderArea .content').show();

		}

	});
}

function createContexts() {
	let phrases = dataStorage.getPhrasesData();
	let phrasesArray = phrases.getContent();

	let phrasesContexts = [];
	for (var i = 0; i < phrasesArray.length; i++) {
		if (!phrasesArray[i].removed) {
			phrasesContexts.push(createRowContext(phrasesArray, i));
		}
	}

	let headerContext = createHeaderContexts(phrases);

	return Mustache.render(templateLoader.getTemplate('phrases-table'), {
		header: {
			heading: headerContext
		},
		content: phrasesContexts
	}, {
		'phrase-row': templateLoader.getTemplate('phrase-row'),
		'view-content': templateLoader.getTemplate('row-view-content')
	});
}

function createHeaderContexts(phrases) {
	let meta = phrases.getMeta();
	let headerContext = ['Key'];
	for (let i = 0; i < meta.length; i++) {
		headerContext.push(meta[i].name);
	}
	return headerContext;
}

function createRowContext(phrases, index) {
	let data = phrases[index].content;
	let columnPercent = 100 / data.length;
	let columns = [];
	for (let i = 0; i < data.length; i++) {
		columns[i] = {
			data: data[i],
			columnPercent: columnPercent,
			index: i,
			key: data[0]
		};
	}

	return {
		index: index,
		column: columns,
		removed: phrases[index].removed
	};
}

function transformToForm(clickedTr) {
	if (clickedTr.hasClass('is-form')) {
		return;
	}

	clickedTr.addClass('is-form');

	let index = clickedTr.data("index");
	let phrases = dataStorage.getPhrasesData();
	let meta = phrases.getMeta();
	let phrasesArray = phrases.getContent();

	let formContext = [{ locale: 'Key', 'meta-index': -1, value: phrasesArray[index].content[0] }];
	for (let i = 0; i < meta.length; i++) {
		formContext.push({
			locale: meta[i].name,
			'meta-index': i,
			value: phrasesArray[index].content[i + 1]
		});
	}

	clickedTr.html(Mustache.render(templateLoader.getTemplate('row-edit-content'), {
		phrases: formContext,
		enumKey: javaEnumFactory.createJavaKey(phrasesArray[index].content[0]),
		removed: phrasesArray[index].removed
	}));

	$('.cancel-button', clickedTr).click(function(event) {
		event.stopPropagation();
		transformToView(clickedTr);
	});

	$('.ok-button', clickedTr).click(function(event) {
		event.stopPropagation();
		try {
			let newPhrases = collectText(clickedTr);
			phrases.setContentRow(index, newPhrases);
			phrases.setState('dirty');

			transformToView(clickedTr);
		} catch (validationError) {
			alert(validationError);
		}
	});

	$('.copy-button', clickedTr).click(function(event) {
		event.stopPropagation();
		let newPhrases = collectText(clickedTr);
		let stringRepresentation = JSON.stringify(newPhrases);
		clipboard.writeText(stringRepresentation);
	});

	$('.paste-button', clickedTr).click(function(event) {
		event.stopPropagation();
		let clipboardArray = JSON.parse(clipboard.readText());
		if (!Array.isArray(clipboardArray) || clipboardArray.length != meta.length + 1) {
			return;
		}

		$('input', clickedTr).each(function(notUsed, element) {
			let inputElement = $(element);
			let metaIndex = inputElement.data('meta');
			inputElement.val(clipboardArray[metaIndex + 1])
		});
	});

	$('.remove-button', clickedTr).click(function(event) {
		event.stopPropagation();
		phrases.toggleRemoveContentRow(index);
		phrases.setState('dirty');

		transformToView(clickedTr);
	});
}

function transformToView(clickedTr) {
	let index = clickedTr.data("index");
	let phrases = dataStorage.getPhrasesData();
	let phrasesArray = phrases.getContent();

	clickedTr.html(Mustache.render(templateLoader.getTemplate('row-view-content'), createRowContext(phrasesArray, index)));
	clickedTr.removeClass('is-form');

	if (clickedTr.offset().top < $(window).scrollTop()) {
		$('html,body').animate({ scrollTop: clickedTr.offset().top });
	}
}

function addRow() {
	let phrases = dataStorage.getPhrasesData();
	let newIndex = phrases.addContentRow();
	let context = createRowContext(phrases.getContent(), newIndex);
	let newTr = $(Mustache.render(templateLoader.getTemplate('phrase-row'), context, {
		'view-content': templateLoader.getTemplate('row-view-content')
	}));
	newTr.appendTo($('#renderArea table'));
	newTr.click(function() {
		transformToForm($(this));
	});

	newTr.click();

	if (newTr.offset().top > $(window).scrollTop()) {
		$('html,body').animate({ scrollTop: newTr.offset().top });
	}
}

function collectText(someFormTr) {
	let newPhrases = [];
	$('input', someFormTr).each(function(notUsed, element) {
		let inputElement = $(element);
		let metaIndex = inputElement.data('meta');
		newPhrases[metaIndex + 1] = inputElement.val()
	});
	if (!/.+~.+/.test(newPhrases[0])) {
		throw "Invalid key";
	}
	return newPhrases;
}

function updateTitle() {
	let openedFile = dataStorage.getDirectoryPath() || "No file opened";
	let title = "Phrases Editor - " + openedFile;
	switch (dataStorage.getState()) {
		case 'idle':
			break;
		case 'dirty':
			title += " - Unsaved data";
			break;
		case 'save':
			title += " - Saving data";
			break;
		case 'load':
			title += " - Loading data";
			break;
	}
	document.title = title;
}

module.exports.renderData = renderData;
module.exports.updateTitle = updateTitle;
module.exports.addRow = addRow;
module.exports.filterForSearch = filterForSearch;