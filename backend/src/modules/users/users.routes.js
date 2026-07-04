const express = require('express');
const { protect } = require('../../core/middlewares/auth.middleware');
const requireRoles = require('../../core/middlewares/role.middleware');
const usersController = require('./users.controller');

const router = express.Router();

router.use(protect);

router.put('/me', usersController.updateMyProfile);

router.get('/workers', requireRoles('admin', 'dispatcher'), usersController.listWorkers);

router.get('/', requireRoles('admin'), usersController.getUsers);
router.put('/:id/status', requireRoles('admin'), usersController.updateUserStatus);
router.put('/:id/role', requireRoles('admin'), usersController.updateUserRole);

module.exports = router;