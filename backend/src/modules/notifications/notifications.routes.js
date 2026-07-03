const express = require('express');
const { protect } = require('../../core/middlewares/auth.middleware');
const notificationsController = require('./notifications.controller');

const router = express.Router();

router.use(protect);

router.get('/', notificationsController.getNotifications);
router.patch('/:id/read', notificationsController.markAsRead);

module.exports = router;
