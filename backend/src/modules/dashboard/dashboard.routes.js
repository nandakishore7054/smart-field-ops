const express = require('express');
const { protect } = require('../../core/middlewares/auth.middleware');
const requireRoles = require('../../core/middlewares/role.middleware');
const dashboardController = require('./dashboard.controller');

const router = express.Router();

router.use(protect);
router.use(requireRoles('admin', 'dispatcher'));

router.get('/analytics', dashboardController.getDashboardAnalytics);
router.get('/charts', dashboardController.getDashboardCharts);

module.exports = router;
