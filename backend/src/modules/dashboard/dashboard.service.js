const User = require('../auth/auth.model');
const AttendanceRecord = require('../attendance/attendance.model');
const CustomerVisit = require('../tracking/customerVisit.model');
const WorkerLocation = require('../tracking/location.model');
const trackingService = require('../tracking/tracking.service');
const { calculateTotalDistance } = require('../../core/utils/distance.util');

// Add lightweight cache
let cache = {
  data: null,
  timestamp: 0
};
const CACHE_TTL = 30 * 1000; // 30 seconds

// Helpers
function getStartOfDay(date = new Date()) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function getEndOfDay(date = new Date()) {
  const d = new Date(date);
  d.setUTCHours(23, 59, 59, 999);
  return d;
}

async function getWorkerKPIs() {
  const totalWorkers = await User.countDocuments({ role: 'worker' });
  const activeWorkersArray = await trackingService.getActiveWorkers();
  const activeWorkers = activeWorkersArray.length;
  const offlineWorkers = Math.max(0, totalWorkers - activeWorkers);

  return { activeWorkers, offlineWorkers, totalWorkers };
}

async function getAttendanceKPIs(start, end) {
  const attendances = await AttendanceRecord.find({ date: { $gte: start, $lte: end } });
  
  const presentToday = attendances.length;
  const checkedOutToday = attendances.filter(a => a.checkOut).length;

  let totalWorkingMs = 0;
  let completedShifts = 0;

  for (const a of attendances) {
    if (a.checkIn && a.checkOut) {
      completedShifts++;
      totalWorkingMs += (new Date(a.checkOut.time) - new Date(a.checkIn.time));
    }
  }

  const averageWorkingMs = completedShifts > 0 ? totalWorkingMs / completedShifts : 0;
  
  const formatDuration = (ms) => {
    if (ms === 0) return null;
    const h = Math.floor(ms / (1000 * 60 * 60));
    const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${h}h ${m}m`;
  };

  return {
    presentToday,
    checkedOutToday,
    averageWorkingHours: formatDuration(averageWorkingMs)
  };
}

async function getVisitKPIs(start, end) {
  const visits = await CustomerVisit.find({ arrivalTime: { $gte: start, $lte: end } });
  
  const customerVisitsToday = visits.length;
  let totalVisitMs = 0;

  for (const v of visits) {
    const endT = v.departureTime || new Date();
    totalVisitMs += Math.max(0, new Date(endT) - new Date(v.arrivalTime));
  }

  const averageVisitMs = customerVisitsToday > 0 ? totalVisitMs / customerVisitsToday : 0;

  const formatDuration = (ms) => {
    if (ms === 0) return null;
    const h = Math.floor(ms / (1000 * 60 * 60));
    const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return {
    customerVisitsToday,
    averageVisitDuration: formatDuration(averageVisitMs)
  };
}

async function getDistanceKPIs(start, end) {
  // Fetch all locations for today
  const locations = await WorkerLocation.find({ timestamp: { $gte: start, $lte: end } }).sort({ timestamp: 1 });
  
  // Group by workerId
  const byWorker = {};
  for (const loc of locations) {
    const wId = loc.workerId.toString();
    if (!byWorker[wId]) byWorker[wId] = [];
    byWorker[wId].push(loc);
  }

  let totalDistanceToday = 0;
  for (const wId in byWorker) {
    totalDistanceToday += calculateTotalDistance(byWorker[wId]);
  }

  return {
    totalDistanceToday: totalDistanceToday > 0 ? `${totalDistanceToday.toFixed(2)} km` : null
  };
}

async function getDashboardAnalytics() {
  const now = Date.now();
  if (cache.data && (now - cache.timestamp < CACHE_TTL)) {
    return cache.data;
  }

  const start = getStartOfDay();
  const end = getEndOfDay();

  const [workerKPIs, attendanceKPIs, visitKPIs, distanceKPIs] = await Promise.all([
    getWorkerKPIs(),
    getAttendanceKPIs(start, end),
    getVisitKPIs(start, end),
    getDistanceKPIs(start, end)
  ]);

  const result = {
    workforce: workerKPIs,
    attendance: attendanceKPIs,
    customer: visitKPIs,
    productivity: distanceKPIs
  };

  cache = {
    data: result,
    timestamp: now
  };

  return result;
}

module.exports = {
  getDashboardAnalytics,
  getWorkerKPIs,
  getAttendanceKPIs,
  getVisitKPIs,
  getDistanceKPIs
};
