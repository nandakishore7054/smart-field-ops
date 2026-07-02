const express = require('express');
const { protect } = require('../../core/middlewares/auth.middleware');
const requireRoles = require('../../core/middlewares/role.middleware');
const usersController = require('./users.controller');

const router = express.Router();

router.get('/workers', protect, requireRoles('admin', 'dispatcher'), usersController.listWorkers);

module.exports = router;