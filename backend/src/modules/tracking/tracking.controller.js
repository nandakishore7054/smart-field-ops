const asyncHandler = require('../../core/utils/asyncHandler');
const { successResponse } = require('../../core/utils/apiResponse');
const trackingService = require('./tracking.service');
const { parseLocation } = require('./tracking.validation');

const submitLocation = asyncHandler(async (req, res) => {
  const parsed = parseLocation(req.body);
  if (!parsed.success) {
    return res.status(400).json({ status: 'fail', error: parsed.error });
  }

  const record = await trackingService.saveLocation(req.user._id, parsed.data);
  return successResponse(res, 201, record, 'Location saved successfully.');
});

const getActiveWorkers = asyncHandler(async (req, res) => {
  const workers = await trackingService.getActiveWorkers();
  return successResponse(res, 200, workers);
});

module.exports = {
  submitLocation,
  getActiveWorkers,
};
