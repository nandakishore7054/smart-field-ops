const turf = require('@turf/turf');

/**
 * Calculates the total Haversine distance for an array of locations sequentially.
 * @param {Array} locations - Array of location documents containing `.location.coordinates` as [lng, lat].
 * @returns {Number} - Total distance in kilometers.
 */
function calculateTotalDistance(locations) {
  if (!locations || locations.length < 2) return 0;

  let totalDistance = 0;
  for (let i = 1; i < locations.length; i++) {
    const prev = locations[i - 1];
    const curr = locations[i];

    if (prev?.location?.coordinates && curr?.location?.coordinates) {
      const from = turf.point(prev.location.coordinates);
      const to = turf.point(curr.location.coordinates);
      totalDistance += turf.distance(from, to, { units: 'kilometers' });
    }
  }

  return totalDistance;
}

module.exports = {
  calculateTotalDistance
};
