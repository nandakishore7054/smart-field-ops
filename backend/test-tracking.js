require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const User = require('./src/modules/auth/auth.model');
const AttendanceRecord = require('./src/modules/attendance/attendance.model');
const trackingService = require('./src/modules/tracking/tracking.service');
const WorkerLocation = require('./src/modules/tracking/location.model');

async function runTest() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');

  // Clean up
  await User.deleteMany({ email: 'testtracker@test.com' });
  await AttendanceRecord.deleteMany({});
  await WorkerLocation.deleteMany({});

  // Create Worker
  const worker = await User.create({ name: 'Test Tracker', email: 'testtracker@test.com', password: 'password', role: 'worker' });
  console.log('Worker created');

  // 1. Test saveLocation
  const locRecord = await trackingService.saveLocation(worker._id, {
    latitude: 37.7749,
    longitude: -122.4194,
    accuracy: 10,
    speed: 0,
    isMoving: false,
    timestamp: new Date()
  });
  console.log('Location saved:', locRecord.location.coordinates);

  // 2. Test getActiveWorkers (no attendance yet)
  let activeWorkers = await trackingService.getActiveWorkers();
  console.log('Active workers (expect 0):', activeWorkers.length);

  // Check in
  const now = new Date();
  const d = new Date(now);
  d.setUTCHours(0,0,0,0);
  
  await AttendanceRecord.create({
    workerId: worker._id,
    date: d,
    status: 'present',
    checkIn: { time: now }
  });

  // Test getActiveWorkers again
  activeWorkers = await trackingService.getActiveWorkers();
  console.log('Active workers (expect 1):', activeWorkers.length);
  if (activeWorkers.length > 0) {
    console.log('Worker name:', activeWorkers[0].workerName);
    console.log('Worker Location:', activeWorkers[0].latitude, activeWorkers[0].longitude);
    console.log('Worker status:', activeWorkers[0].attendanceStatus);
  }

  await mongoose.disconnect();
}

runTest().catch(console.error);
