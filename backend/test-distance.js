const mongoose = require('mongoose');
require('dotenv').config();
const { getStartOfDay, getEndOfDay } = require('./src/core/utils/date.util');
const WorkerLocation = require('./src/modules/tracking/location.model');
const { filterValidLocations } = require('./src/core/utils/distance.util');
const turf = require('@turf/turf');

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const start = getStartOfDay();
  const end = getEndOfDay();
  
  const locations = await WorkerLocation.find({ timestamp: { $gte: start, $lte: end } }).sort({ timestamp: 1 });
  const valid = filterValidLocations(locations);
  
  if (valid.length > 1) {
    for (let i = 1; i < valid.length; i++) {
       const from = valid[i-1].location.coordinates;
       const to = valid[i].location.coordinates;
       const dist = turf.distance(turf.point(from), turf.point(to), { units: 'kilometers' });
       console.log('Valid Segment ' + i + ' Dist: ' + dist);
    }
  }
  mongoose.disconnect();
}
test().catch(console.error);
