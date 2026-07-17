const mongoose = require('mongoose');
require('dotenv').config();
const dashboardService = require('./src/modules/dashboard/dashboard.service');
const trackingService = require('./src/modules/tracking/tracking.service');
const { getStartOfDay, getEndOfDay, formatLocalYYYYMMDD } = require('./src/core/utils/date.util');

async function verify() {
  await mongoose.connect(process.env.MONGO_URI);
  
  // Use July 11, 2026 for verification as it contains valid movement data
  const testDate = new Date('2026-07-11T12:00:00Z');
  const start = getStartOfDay(testDate);
  const end = getEndOfDay(testDate);
  const dateStr = formatLocalYYYYMMDD(testDate);

  console.log('--- Verification for Date:', dateStr, '---');

  // 1. Dashboard Total Distance KPI
  const kpis = await dashboardService.getDistanceKPIs(start, end);
  console.log('1. Dashboard Total Distance KPI:', kpis.totalDistanceToday);

  // 2. Distance Trend Chart
  const WorkerLocation = require('./src/modules/tracking/location.model');
  const { calculateTotalDistance } = require('./src/core/utils/distance.util');
  
  const locations = await WorkerLocation.find({ timestamp: { $gte: start, $lte: end } }).sort({ timestamp: 1 });
  
  const byWorker = {};
  for(const loc of locations) {
    const wId = loc.workerId.toString();
    if(!byWorker[wId]) byWorker[wId] = [];
    byWorker[wId].push(loc);
  }

  let totalDistChart = 0;
  for(const wId in byWorker) {
    totalDistChart += calculateTotalDistance(byWorker[wId]);
  }
  console.log('2. Distance Trend Chart (for July 11):', Number(totalDistChart.toFixed(2)), 'km');

  // 3. Top Distance Worker
  let topWorkerId = null;
  let topDist = -1;
  for (const wId in byWorker) {
    const dist = calculateTotalDistance(byWorker[wId]);
    if (dist > topDist) {
      topDist = dist;
      topWorkerId = wId;
    }
  }
  console.log('3. Top Distance Worker:', Number(topDist.toFixed(2)), 'km');

  // 4. Worker Daily Summary
  if (topWorkerId) {
    const summary = await trackingService.getWorkerDailySummary(topWorkerId, dateStr);
    console.log('4. Worker Daily Summary (for top worker):', summary.distanceTravelled);
    
    // 5. Live Tracking popup (Trail endpoint returns totalDistance)
    const trail = await trackingService.getWorkerTrail(topWorkerId, dateStr);
    console.log('5. Live Tracking popup (API totalDistance):', Number(trail.totalDistance.toFixed(2)), 'km');
  }

  mongoose.disconnect();
}
verify().catch(console.error);
