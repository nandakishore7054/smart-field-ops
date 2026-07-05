const express = require('express');
const { protect } = require('../../core/middlewares/auth.middleware');
const requireRoles = require('../../core/middlewares/role.middleware');
const availabilityController = require('./availability.controller');

const router = express.Router();

router.use(protect);

// Worker self-manage routes
router.get('/availability/me', requireRoles('worker'), availabilityController.getMyAvailability);
router.put('/availability/me', requireRoles('worker'), availabilityController.setMyAvailability);
router.get('/leave-requests/me', requireRoles('worker'), availabilityController.getMyLeaveRequests);
router.post('/leave-requests', requireRoles('worker'), availabilityController.submitLeaveRequest);

// Admin/Dispatcher routes (view availability)
router.get('/availability/:workerId', requireRoles('admin', 'dispatcher'), availabilityController.getWorkerAvailability);

// Admin routes (manage)
router.put('/availability/:workerId', requireRoles('admin'), availabilityController.setWorkerAvailability);
router.get('/leave-requests', requireRoles('admin', 'dispatcher'), availabilityController.getLeaveRequests); // Dispatcher view only
router.patch('/leave-requests/:id/approve', requireRoles('admin'), availabilityController.approveLeaveRequest);

module.exports = router;
