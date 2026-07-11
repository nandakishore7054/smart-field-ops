const trackingService = require('./tracking.service');
const { parseLocation } = require('./tracking.validation');
const geofenceService = require('./geofence.service');

// Throttling map: workerId -> last timestamp
const lastUpdateMap = new Map();

function setupTrackingSockets(io) {
  io.on('connection', (socket) => {
    socket.on('worker:location-update', async (data) => {
      // Enforce: only workers can send GPS updates
      if (!socket.user || socket.user.role !== 'worker') {
        return; // Silently drop non-worker GPS updates
      }

      // Use the authenticated user's ID — never trust the client payload
      const workerIdStr = socket.user._id;

      if (!data) return;
      
      const { workerId: _untrusted, ...locationData } = data;
      
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
        
        // Broadcast to admin room — use the verified identity
        io.to('admin').emit('location:updated', {
          workerId: workerIdStr,
          workerName: socket.user.name,
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

