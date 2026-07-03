const Notification = require('./notifications.model');
const ApiError = require('../../core/utils/apiError');

async function getNotifications(userId) {
  const notifications = await Notification.find({ userId })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return { notifications };
}

async function markAsRead(notificationId, userId, isRead) {
  const notification = await Notification.findOne({ _id: notificationId, userId });

  if (!notification) {
    throw new ApiError(404, 'Notification not found.');
  }

  notification.isRead = isRead;
  await notification.save();

  return notification.toObject ? notification.toObject() : { ...notification };
}

async function createNotification(payload) {
  const notification = await Notification.create(payload);
  return notification.toObject ? notification.toObject() : { ...notification };
}

module.exports = {
  getNotifications,
  markAsRead,
  createNotification,
};
