const asyncHandler = require('../../core/utils/asyncHandler');
const { successResponse } = require('../../core/utils/apiResponse');
const attendanceService = require('./attendance.service');
const {
  parseCheckIn,
  parseCheckOut,
  parseShift,
  parseManualCorrection,
} = require('./attendance.validation');

// -- Attendance --

const checkIn = asyncHandler(async (req, res) => {
  const parsed = parseCheckIn(req.body);
  if (!parsed.success) {
    return res.status(400).json({ status: 'fail', error: parsed.error });
  }

  const record = await attendanceService.checkIn(req.user._id, parsed.data);
  return successResponse(res, 201, record, 'Checked in successfully.');
});

const checkOut = asyncHandler(async (req, res) => {
  const parsed = parseCheckOut(req.body);
  if (!parsed.success) {
    return res.status(400).json({ status: 'fail', error: parsed.error });
  }

  const record = await attendanceService.checkOut(req.user._id, parsed.data);
  return successResponse(res, 200, record, 'Checked out successfully.');
});

const getMyAttendance = asyncHandler(async (req, res) => {
  const records = await attendanceService.getMyAttendance(req.user._id);
  return successResponse(res, 200, records);
});

const getAllAttendance = asyncHandler(async (req, res) => {
  const filters = {};
  if (req.query.date) filters.date = req.query.date;
  if (req.query.status) filters.status = req.query.status;

  const records = await attendanceService.getAllAttendance(filters);
  return successResponse(res, 200, records);
});

const updateAttendance = asyncHandler(async (req, res) => {
  const parsed = parseManualCorrection(req.body);
  if (!parsed.success) {
    return res.status(400).json({ status: 'fail', error: parsed.error });
  }

  const record = await attendanceService.updateAttendance(req.params.id, parsed.data);
  return successResponse(res, 200, record, 'Attendance record updated.');
});

// -- Shifts --

const createShift = asyncHandler(async (req, res) => {
  const parsed = parseShift(req.body);
  if (!parsed.success) {
    return res.status(400).json({ status: 'fail', error: parsed.error });
  }

  const shift = await attendanceService.createShift(parsed.data);
  return successResponse(res, 201, shift, 'Shift created.');
});

const getShifts = asyncHandler(async (req, res) => {
  const shifts = await attendanceService.getShifts();
  return successResponse(res, 200, shifts);
});

const updateShift = asyncHandler(async (req, res) => {
  const parsed = parseShift(req.body);
  if (!parsed.success) {
    return res.status(400).json({ status: 'fail', error: parsed.error });
  }

  const shift = await attendanceService.updateShift(req.params.id, parsed.data);
  return successResponse(res, 200, shift, 'Shift updated.');
});

const deleteShift = asyncHandler(async (req, res) => {
  await attendanceService.deleteShift(req.params.id);
  return successResponse(res, 200, null, 'Shift deleted.');
});

module.exports = {
  checkIn,
  checkOut,
  getMyAttendance,
  getAllAttendance,
  updateAttendance,
  createShift,
  getShifts,
  updateShift,
  deleteShift,
};
