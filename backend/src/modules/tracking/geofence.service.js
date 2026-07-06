const Geofence = require('./geofence.model');
const Notification = require('../notifications/notifications.model');
const turf = require('@turf/turf');

// In-memory state tracking: workerId -> Set of Geofence IDs they are currently inside
const workerGeofenceState = new Map();

async function createGeofence(payload, userId) {
  const geofence = await Geofence.create({ ...payload, createdBy: userId });
  return geofence;
}

async function getGeofences() {
  return Geofence.find().sort({ createdAt: -1 });
}

async function getGeofenceById(id) {
  return Geofence.findById(id);
}

async function updateGeofence(id, payload) {
  return Geofence.findByIdAndUpdate(id, payload, { new: true });
}

async function deleteGeofence(id) {
  return Geofence.findByIdAndDelete(id);
}

async function checkGeofenceTransitions(workerId, location) {
  if (!workerId || !location) return;

  const workerIdStr = workerId.toString();
  const activeGeofences = await Geofence.find({ isActive: true });

  const currentGeofences = new Set();
  const point = turf.point([location.longitude, location.latitude]);

  console.log(`\n[GEOFENCE DEBUG] Checking transitions for worker: ${workerIdStr}`);
  console.log(`[GEOFENCE DEBUG] Location: [${location.longitude}, ${location.latitude}]`);
  console.log(`[GEOFENCE DEBUG] Active Geofences found: ${activeGeofences.length}`);

  for (const geofence of activeGeofences) {
    let isInside = false;

    if (geofence.type === 'polygon' && geofence.boundary && geofence.boundary.coordinates) {
      try {
        const polygon = turf.polygon(geofence.boundary.coordinates);
        isInside = turf.booleanPointInPolygon(point, polygon);
        console.log(`[GEOFENCE DEBUG] Polygon '${geofence.name}' check -> isInside: ${isInside}`);
      } catch (err) {
        console.error(`[GEOFENCE DEBUG] Invalid polygon geometry for geofence ${geofence._id}`, err);
      }
    } else if (geofence.type === 'circle' && geofence.center && geofence.center.coordinates && geofence.radius) {
      try {
        const center = turf.point(geofence.center.coordinates);
        const distance = turf.distance(center, point, { units: 'meters' });
        isInside = distance <= geofence.radius;
        console.log(`[GEOFENCE DEBUG] Circle '${geofence.name}' check -> distance: ${distance}, radius: ${geofence.radius} -> isInside: ${isInside}`);
      } catch (err) {
        console.error(`[GEOFENCE DEBUG] Invalid circle geometry for geofence ${geofence._id}`, err);
      }
    }

    if (isInside) {
      currentGeofences.add(geofence._id.toString());
    }
  }

  const previousGeofences = workerGeofenceState.get(workerIdStr) || new Set();
  console.log(`[GEOFENCE DEBUG] Previous state:`, Array.from(previousGeofences));
  console.log(`[GEOFENCE DEBUG] Current state:`, Array.from(currentGeofences));

  // Find newly entered geofences
  for (const geofenceId of currentGeofences) {
    if (!previousGeofences.has(geofenceId)) {
      const geofence = activeGeofences.find(g => g._id.toString() === geofenceId);
      console.log(`[GEOFENCE DEBUG] => EMITTING geofence:entered for ${geofence?.name}`);
      global.io?.to('admin').emit('geofence:entered', {
        workerId: workerIdStr,
        geofenceId: geofenceId,
        geofenceName: geofence?.name,
        timestamp: new Date()
      });
      await Notification.create({
        userId: workerIdStr,
        type: 'system',
        message: `Entered geofence: ${geofence?.name}`,
      });
    }
  }

  // Find exited geofences
  for (const geofenceId of previousGeofences) {
    if (!currentGeofences.has(geofenceId)) {
      let geofence = activeGeofences.find(g => g._id.toString() === geofenceId);
      if (!geofence) {
        geofence = await Geofence.findById(geofenceId);
      }
      console.log(`[GEOFENCE DEBUG] => EMITTING geofence:exited for ${geofence?.name || geofenceId}`);
      global.io?.to('admin').emit('geofence:exited', {
        workerId: workerIdStr,
        geofenceId: geofenceId,
        geofenceName: geofence?.name || geofenceId,
        timestamp: new Date()
      });
      await Notification.create({
        userId: workerIdStr,
        type: 'system',
        message: `Exited geofence: ${geofence?.name || geofenceId}`,
      });
    }
  }

  workerGeofenceState.set(workerIdStr, currentGeofences);
}

module.exports = {
  createGeofence,
  getGeofences,
  getGeofenceById,
  updateGeofence,
  deleteGeofence,
  checkGeofenceTransitions,
};
