const trackingService = require('./tracking.service');
const { parseLocation } = require('./tracking.validation');
const geofenceService = require('./geofence.service');

// Throttling map: workerId -> last timestamp
const lastUpdateMap = new Map();

function setupTrackingSockets(io) {
  io.on('connection', (socket) => {
    socket.on('worker:location-update', async (data) => {
      if (!data || !data.workerId) return; // Drop if no workerId provided
      
      const { workerId, ...locationData } = data;
      const workerIdStr = workerId.toString();
      
      const now = Date.now();
      const lastUpdate = lastUpdateMap.get(workerIdStr) || 0;
      
      // Throttle: 1 update per 5 seconds (5000ms)
      if (now - lastUpdate < 5000) {
        return; // Silently drop throttled update
      }
      
      // Update the throttle timestamp immediately to prevent race conditions from rapid concurrent requests
      lastUpdateMap.set(workerIdStr, now);
      
      try {
        const parsed = parseLocation(locationData);
        if (!parsed.success) {
          console.error('Socket location validation failed:', parsed.error);
          return;
        }
        
        console.log(`[TRACE: SOCKET] Location received for worker ${workerIdStr}:`, parsed.data);
        // Update latest location in DB
        const record = await trackingService.saveLocation(workerIdStr, parsed.data);
        console.log(`[TRACE: DB] Location saved to DB for worker ${workerIdStr}. Timestamp:`, record.timestamp);
        
        // Fetch the user to get the name for the socket payload
        const User = require('../auth/auth.model');
        const worker = await User.findById(workerIdStr).select('name');
        
        // Broadcast to admin room
        io.to('admin').emit('location:updated', {
          workerId: workerIdStr,
          workerName: worker ? worker.name : 'Unknown Worker',
          latitude: parsed.data.latitude,
          longitude: parsed.data.longitude,
          timestamp: record.timestamp,
        });

        // Trigger geofence logic async
        console.log(`[TRACE: GEOFENCE] Triggering checkGeofenceTransitions for worker ${workerIdStr}`);
        geofenceService.checkGeofenceTransitions(workerIdStr, parsed.data).catch(err => {
          console.error('[TRACE: ERROR] Geofence check error:', err);
        });
        
      } catch (err) {
        console.error('Socket tracking error:', err.message);
      }
    });
  });
}

module.exports = { setupTrackingSockets };
