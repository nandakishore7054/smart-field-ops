const express = require('express');
const { protect } = require('../../core/middlewares/auth.middleware');
const requireRoles = require('../../core/middlewares/role.middleware');
const attendanceController = require('./attendance.controller');

const attendanceRouter = express.Router();
const shiftsRouter = express.Router();

// Apply auth protection to all routes
attendanceRouter.use(protect);
shiftsRouter.use(protect);

// -- Attendance Routes --

// Worker routes
attendanceRouter.post('/check-in', requireRoles('worker'), attendanceController.checkIn);
attendanceRouter.post('/check-out', requireRoles('worker'), attendanceController.checkOut);
attendanceRouter.get('/me', requireRoles('worker'), attendanceController.getMyAttendance);

// Admin routes
attendanceRouter.get('/', requireRoles('admin', 'dispatcher'), attendanceController.getAllAttendance);
attendanceRouter.put('/:id', requireRoles('admin'), attendanceController.updateAttendance);


// -- Shifts Routes -- (Admin only)
shiftsRouter.post('/', requireRoles('admin'), attendanceController.createShift);
shiftsRouter.get('/', requireRoles('admin'), attendanceController.getShifts);
shiftsRouter.put('/:id', requireRoles('admin'), attendanceController.updateShift);
shiftsRouter.delete('/:id', requireRoles('admin'), attendanceController.deleteShift);

module.exports = {
  attendanceRouter,
  shiftsRouter,
};
