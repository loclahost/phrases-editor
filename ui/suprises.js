function changeTextColor() {
	window.setTimeout(function() {
		$('body').css('color', 'red');
		window.setTimeout(function() {
			$('body').css('color', 'blue');
			window.setTimeout(function() {
				$('body').css('color', 'green');
				window.setTimeout(function() {
					$('body').css('color', 'yellow');
					window.setTimeout(function() {
						$('body').css('color', 'pink');
						window.setTimeout(function() {
							$('body').css('color', '');
						}, 2000);
					}, 2000);
				}, 2000);
			}, 2000);
		}, 2000);
	}, 2000);
}

function initiateSuprises() {
	window.setInterval(function() {
		changeTextColor();
	}, 300000);
}

module.exports.initiateSuprises = initiateSuprises;