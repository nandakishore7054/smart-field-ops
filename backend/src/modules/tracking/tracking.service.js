const WorkerLocation = require('./location.model');
const AttendanceRecord = require('../attendance/attendance.model');

// Helper to normalize date to midnight UTC for the day
function getStartOfDay(date) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

async function saveLocation(workerId, payload) {
  const record = new WorkerLocation({
    workerId,
    location: {
      type: 'Point',
      coordinates: [payload.longitude, payload.latitude],
    },
    accuracy: payload.accuracy,
    speed: payload.speed,
    heading: payload.heading,
    batteryLevel: payload.batteryLevel,
    isMoving: payload.isMoving,
    timestamp: payload.timestamp || new Date(),
  });

  await record.save();
  return record;
}

async function getActiveWorkers() {
  const now = new Date();
  const date = getStartOfDay(now);

  // 1. Get all workers who are checked in today and haven't checked out
  const activeAttendances = await AttendanceRecord.find({
    date,
    checkOut: { $exists: false },
  }).populate('workerId', 'name email');

  // Load CustomerVisit model
  const CustomerVisit = require('./customerVisit.model');

  // 2. Fetch the latest location for each active worker
  const activeWorkersWithLocation = await Promise.all(
    activeAttendances.map(async (attendance) => {
      // If the worker document was deleted but attendance exists, skip or handle safely
      if (!attendance.workerId) return null;

      const workerId = attendance.workerId._id;
      
      const latestLocation = await WorkerLocation.findOne({ workerId })
        .sort({ timestamp: -1 })
        .select('location timestamp accuracy speed isMoving batteryLevel');

      let latitude = null;
      let longitude = null;
      let timestamp = null;
      let accuracy = null;
      let speed = null;
      let isMoving = null;
      let batteryLevel = null;

      if (latestLocation && latestLocation.location && latestLocation.location.coordinates) {
        longitude = latestLocation.location.coordinates[0];
        latitude = latestLocation.location.coordinates[1];
        timestamp = latestLocation.timestamp;
        accuracy = latestLocation.accuracy;
        speed = latestLocation.speed;
        isMoving = latestLocation.isMoving;
        batteryLevel = latestLocation.batteryLevel;
      } else if (attendance.checkIn && attendance.checkIn.location) {
        // Fallback to check-in location if no active tracking ping exists
        longitude = attendance.checkIn.location.coordinates[0];
        latitude = attendance.checkIn.location.coordinates[1];
        timestamp = attendance.checkIn.time;
      }

      // Check active CustomerVisit
      const activeVisit = await CustomerVisit.findOne({
        workerId: workerId,
        departureTime: null
      }).populate('geofenceId', 'name category');
      
      let currentGeofence = null;
      let geofenceArrivalTime = null;

      if (activeVisit && activeVisit.geofenceId) {
        currentGeofence = activeVisit.geofenceId.name;
        geofenceArrivalTime = activeVisit.arrivalTime;
      }

      return {
        workerId: workerId,
        workerName: attendance.workerId.name,
        email: attendance.workerId.email,
        latitude,
        longitude,
        timestamp,
        accuracy,
        speed,
        isMoving,
        batteryLevel,
        attendanceStatus: attendance.status,
        currentGeofence,
        geofenceArrivalTime
      };
    })
  );

  return activeWorkersWithLocation.filter(w => w !== null);
}

module.exports = {
  saveLocation,
  getActiveWorkers,
};
