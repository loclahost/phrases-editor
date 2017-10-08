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

function rotateImages() {
	window.setTimeout(function() {
		$('img').css('transform', 'rotate(270deg)');
		window.setTimeout(function() {
			$('img').css('transform', '');
		}, 2000);
	}, 2000);
}

function initiateSurprises() {
	window.setInterval(function() {
		let randomNumber = Math.random();
		if (randomNumber < 0.25) {
			changeTextColor();
		} else if (randomNumber < 0.5) {
			rotateImages();
		}
	}, 300000);
}

module.exports.initiateSurprises = initiateSurprises;