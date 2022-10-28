const { v4: uuidv4 } = require('uuid');

let notifications = {};

function createNotification(notification, type) {
	let notificationId = uuidv4();
	notifications[notificationId] = {
		timestamp: Date.now(),
		data: notification,
		type: type || 'info',
	};

	renderNotifications();

	return notificationId;
}

function removeNotification(notificationId) {
	delete notifications[notificationId];

	renderNotifications();
}

function clearNotifications() {
	notifications = {};

	renderNotifications();
}

function renderNotifications() {
	let orderedNotifications = [];
	for (let key in notifications) {
		orderedNotifications.push(notifications[key]);
	}

	let notificationArea = $('#notification-area');
	notificationArea.empty();

	orderedNotifications
		.sort((a, b) => a.timestamp - b.timestamp)
		.forEach((element) => notificationArea.append('<div class="notification notification-type-' + element.type + '">' + element.data + '</div>'));
}

module.exports.createNotification = createNotification;
module.exports.removeNotification = removeNotification;
module.exports.clearNotifications = clearNotifications;
