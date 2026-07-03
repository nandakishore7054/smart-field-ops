const { z } = require('zod');

const updateNotificationSchema = z.object({
  isRead: z.boolean(),
});

function parseNotificationUpdate(data) {
  return updateNotificationSchema.safeParse(data);
}

module.exports = {
  parseNotificationUpdate,
};
