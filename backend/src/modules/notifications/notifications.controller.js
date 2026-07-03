const asyncHandler = require('../../core/utils/asyncHandler');
const ApiError = require('../../core/utils/apiError');
const { successResponse } = require('../../core/utils/apiResponse');
const notificationsService = require('./notifications.service');
const { parseNotificationUpdate } = require('./notifications.validation');

const getNotifications = asyncHandler(async (request, response) => {
  const data = await notificationsService.getNotifications(request.user._id);
  return successResponse(response, 200, data);
});

const markAsRead = asyncHandler(async (request, response) => {
  const result = parseNotificationUpdate(request.body);

  if (!result.success) {
    throw new ApiError(400, 'Invalid notification update payload.', result.error.details);
  }

  const notification = await notificationsService.markAsRead(
    request.params.id,
    request.user._id,
    result.data.isRead
  );

  return successResponse(response, 200, { notification });
});

module.exports = {
  getNotifications,
  markAsRead,
};
