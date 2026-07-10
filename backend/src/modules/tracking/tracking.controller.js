const asyncHandler = require('../../core/utils/asyncHandler');
const { successResponse } = require('../../core/utils/apiResponse');
const trackingService = require('./tracking.service');
const geofenceService = require('./geofence.service');
const { parseLocation } = require('./tracking.validation');

const submitLocation = asyncHandler(async (req, res) => {
  const parsed = parseLocation(req.body);
  if (!parsed.success) {
    return res.status(400).json({ status: 'fail', error: parsed.error });
  }

  const record = await trackingService.saveLocation(req.user._id, parsed.data);
  
  // Trigger async geofence check
  geofenceService.checkGeofenceTransitions(req.user._id, parsed.data).catch(err => {
    console.error('Geofence REST check error:', err);
  });

  return successResponse(res, 201, record, 'Location saved successfully.');
});

const getActiveWorkers = asyncHandler(async (req, res) => {
  const workers = await trackingService.getActiveWorkers();
  return successResponse(res, 200, workers);
});

const getWorkerTrail = asyncHandler(async (req, res) => {
  const { workerId } = req.params;
  const { date } = req.query;
  
  if (!date) {
    return res.status(400).json({ status: 'fail', error: 'Date query parameter is required (YYYY-MM-DD)' });
  }

  const trail = await trackingService.getWorkerTrail(workerId, date);
  return successResponse(res, 200, trail);
});

const findNearestWorkers = asyncHandler(async (req, res) => {
  const { lat, lng } = req.query;
  
  if (!lat || !lng) {
    return res.status(400).json({ status: 'fail', error: 'lat and lng query parameters are required' });
  }

  const nearest = await trackingService.getNearestWorkers(parseFloat(lat), parseFloat(lng));
  return successResponse(res, 200, nearest);
});

module.exports = {
  submitLocation,
  getActiveWorkers,
  getWorkerTrail,
  findNearestWorkers,
};
