const express = require('express');
const { protect } = require('../../core/middlewares/auth.middleware');
const requireRoles = require('../../core/middlewares/role.middleware');
const geofenceController = require('./geofence.controller');

const geofenceRouter = express.Router();

geofenceRouter.use(protect);

// Read (Admin, Dispatcher)
geofenceRouter.get('/', requireRoles('admin', 'dispatcher'), geofenceController.getGeofences);
geofenceRouter.get('/:id', requireRoles('admin', 'dispatcher'), geofenceController.getGeofenceById);

// Write (Admin only)
geofenceRouter.post('/', requireRoles('admin'), geofenceController.createGeofence);
geofenceRouter.put('/:id', requireRoles('admin'), geofenceController.updateGeofence);
geofenceRouter.delete('/:id', requireRoles('admin'), geofenceController.deleteGeofence);

module.exports = geofenceRouter;
