require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const WorkerLocation = require('./src/modules/tracking/location.model');
const Geofence = require('./src/modules/tracking/geofence.model');
const Route = require('./src/modules/tracking/route.model');

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');
    
    // Trigger index creation
    await WorkerLocation.init();
    await Geofence.init();
    await Route.init();
    
    console.log('Indexes created successfully.');
    
    const locIndexes = await WorkerLocation.listIndexes();
    const geoIndexes = await Geofence.listIndexes();
    const routeIndexes = await Route.listIndexes();
    
    console.log('WorkerLocation Indexes:', locIndexes.map(i => i.name));
    console.log('Geofence Indexes:', geoIndexes.map(i => i.name));
    console.log('Route Indexes:', routeIndexes.map(i => i.name));
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}
run();
