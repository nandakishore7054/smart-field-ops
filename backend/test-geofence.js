require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const User = require('./src/modules/auth/auth.model');
const Geofence = require('./src/modules/tracking/geofence.model');
const geofenceService = require('./src/modules/tracking/geofence.service');

// Mock global.io for events
let eventsFired = [];
global.io = {
  to: (room) => ({
    emit: (event, payload) => {
      console.log(`[SOCKET EMIT] Room: ${room}, Event: ${event}, Worker: ${payload.workerId}, Geofence: ${payload.geofenceName}`);
      eventsFired.push(event);
    }
  })
};

async function runTest() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');

  // Clean up
  await User.deleteMany({ email: 'geofenceworker@test.com' });
  await Geofence.deleteMany({ name: 'Test Polygon HQ' });
  eventsFired = [];

  const worker = await User.create({ name: 'Geo Worker', email: 'geofenceworker@test.com', password: 'password', role: 'worker' });
  
  // 1. Create a Polygon Geofence around HQ (e.g. San Francisco)
  const hqGeofence = await geofenceService.createGeofence({
    name: 'Test Polygon HQ',
    type: 'polygon',
    boundary: {
      type: 'Polygon',
      coordinates: [[
        [-122.4200, 37.7740],
        [-122.4200, 37.7760],
        [-122.4180, 37.7760],
        [-122.4180, 37.7740],
        [-122.4200, 37.7740] // close ring
      ]]
    }
  }, worker._id);
  console.log('Created Geofence:', hqGeofence.name);

  // 2. Test outside (e.g. -122.4300, 37.7800)
  console.log('--- Move 1: Outside ---');
  await geofenceService.checkGeofenceTransitions(worker._id, { longitude: -122.4300, latitude: 37.7800 });
  console.log('Events fired:', eventsFired.length);

  // 3. Test inside (e.g. -122.4190, 37.7750)
  console.log('--- Move 2: Inside (Should Enter) ---');
  await geofenceService.checkGeofenceTransitions(worker._id, { longitude: -122.4190, latitude: 37.7750 });
  
  // 4. Test inside again (e.g. -122.4195, 37.7755)
  console.log('--- Move 3: Inside (Should NOT fire again) ---');
  const countBeforeMove3 = eventsFired.length;
  await geofenceService.checkGeofenceTransitions(worker._id, { longitude: -122.4195, latitude: 37.7755 });
  console.log('Extra events fired:', eventsFired.length - countBeforeMove3);

  // 5. Test outside (e.g. -122.4100, 37.7700)
  console.log('--- Move 4: Outside (Should Exit) ---');
  await geofenceService.checkGeofenceTransitions(worker._id, { longitude: -122.4100, latitude: 37.7700 });

  await mongoose.disconnect();
  console.log('Test complete!');
}

runTest().catch(console.error);
