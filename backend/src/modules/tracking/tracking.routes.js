const express = require('express');
const { protect } = require('../../core/middlewares/auth.middleware');
const requireRoles = require('../../core/middlewares/role.middleware');
const trackingController = require('./tracking.controller');

const trackingRouter = express.Router();

trackingRouter.use(protect);

// Worker only
trackingRouter.post('/location', requireRoles('worker'), trackingController.submitLocation);

// Admin / Dispatcher only
trackingRouter.get('/active-workers', requireRoles('admin', 'dispatcher'), trackingController.getActiveWorkers);
trackingRouter.get('/trail/:workerId', requireRoles('admin', 'dispatcher'), trackingController.getWorkerTrail);

module.exports = trackingRouter;
