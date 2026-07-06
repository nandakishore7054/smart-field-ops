const asyncHandler = require('../../core/utils/asyncHandler');
const { successResponse } = require('../../core/utils/apiResponse');
const geofenceService = require('./geofence.service');
const { parseGeofence } = require('./geofence.validation');

const createGeofence = asyncHandler(async (req, res) => {
  const parsed = parseGeofence(req.body);
  if (!parsed.success) {
    return res.status(400).json({ status: 'fail', error: parsed.error });
  }

  const geofence = await geofenceService.createGeofence(parsed.data, req.user._id);
  return successResponse(res, 201, geofence, 'Geofence created successfully.');
});

const getGeofences = asyncHandler(async (req, res) => {
  const geofences = await geofenceService.getGeofences();
  return successResponse(res, 200, geofences);
});

const getGeofenceById = asyncHandler(async (req, res) => {
  const geofence = await geofenceService.getGeofenceById(req.params.id);
  if (!geofence) {
    return res.status(404).json({ status: 'fail', message: 'Geofence not found.' });
  }
  return successResponse(res, 200, geofence);
});

const updateGeofence = asyncHandler(async (req, res) => {
  const parsed = parseGeofence(req.body);
  if (!parsed.success) {
    return res.status(400).json({ status: 'fail', error: parsed.error });
  }

  const geofence = await geofenceService.updateGeofence(req.params.id, parsed.data);
  if (!geofence) {
    return res.status(404).json({ status: 'fail', message: 'Geofence not found.' });
  }
  return successResponse(res, 200, geofence, 'Geofence updated successfully.');
});

const deleteGeofence = asyncHandler(async (req, res) => {
  const geofence = await geofenceService.deleteGeofence(req.params.id);
  if (!geofence) {
    return res.status(404).json({ status: 'fail', message: 'Geofence not found.' });
  }
  return successResponse(res, 200, null, 'Geofence deleted successfully.');
});

module.exports = {
  createGeofence,
  getGeofences,
  getGeofenceById,
  updateGeofence,
  deleteGeofence,
};
