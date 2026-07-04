const express = require('express');
const { protect } = require('../../core/middlewares/auth.middleware');
const requireRoles = require('../../core/middlewares/role.middleware');
const analyticsController = require('./analytics.controller');

const router = express.Router();

router.use(protect);
router.use(requireRoles('admin'));

router.get('/summary', analyticsController.getSummary);
router.get('/worker/:id', analyticsController.getWorkerStats);

module.exports = router;
