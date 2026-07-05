const asyncHandler = require('../../core/utils/asyncHandler');
const { successResponse } = require('../../core/utils/apiResponse');
const availabilityService = require('./availability.service');
const { 
  parseAvailabilityInput, 
  parseLeaveRequestInput, 
  parseLeaveRequestApprove 
} = require('./availability.validation');

const getMyAvailability = asyncHandler(async (req, res) => {
  const availabilities = await availabilityService.getAvailability(req.user._id);
  return successResponse(res, 200, availabilities);
});

const setMyAvailability = asyncHandler(async (req, res) => {
  const parsed = parseAvailabilityInput(req.body);
  if (!parsed.success) {
    return res.status(400).json({ status: 'fail', error: parsed.error });
  }

  await availabilityService.setAvailability(req.user._id, parsed.data.availabilities);
  return successResponse(res, 200, null, 'Availability updated successfully');
});

const getWorkerAvailability = asyncHandler(async (req, res) => {
  const availabilities = await availabilityService.getAvailability(req.params.workerId);
  return successResponse(res, 200, availabilities);
});

const setWorkerAvailability = asyncHandler(async (req, res) => {
  const parsed = parseAvailabilityInput(req.body);
  if (!parsed.success) {
    return res.status(400).json({ status: 'fail', error: parsed.error });
  }

  await availabilityService.setAvailability(req.params.workerId, parsed.data.availabilities);
  return successResponse(res, 200, null, 'Worker availability updated successfully');
});

const submitLeaveRequest = asyncHandler(async (req, res) => {
  const parsed = parseLeaveRequestInput(req.body);
  if (!parsed.success) {
    return res.status(400).json({ status: 'fail', error: parsed.error });
  }

  const leaveRequest = await availabilityService.submitLeaveRequest(req.user._id, parsed.data);
  return successResponse(res, 201, leaveRequest);
});

const getLeaveRequests = asyncHandler(async (req, res) => {
  const requests = await availabilityService.getLeaveRequests();
  return successResponse(res, 200, requests);
});

const getMyLeaveRequests = asyncHandler(async (req, res) => {
  const requests = await availabilityService.getWorkerLeaveRequests(req.user._id);
  return successResponse(res, 200, requests);
});

const approveLeaveRequest = asyncHandler(async (req, res) => {
  const parsed = parseLeaveRequestApprove(req.body);
  if (!parsed.success) {
    return res.status(400).json({ status: 'fail', error: parsed.error });
  }

  const leaveRequest = await availabilityService.approveLeaveRequest(
    req.params.id, 
    req.user._id, 
    parsed.data.status
  );
  return successResponse(res, 200, leaveRequest);
});

module.exports = {
  getMyAvailability,
  setMyAvailability,
  getWorkerAvailability,
  setWorkerAvailability,
  submitLeaveRequest,
  getLeaveRequests,
  getMyLeaveRequests,
  approveLeaveRequest,
};
