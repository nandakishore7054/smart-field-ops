const turf = require('@turf/turf');

const MAX_SPEED_KMH = 150;

/**
 * Calculates the total Haversine distance for an array of locations sequentially.
 * @param {Array} locations - Array of location documents containing `.location.coordinates` as [lng, lat] and `.timestamp`.
 * @returns {Number} - Total distance in kilometers.
 */
function calculateTotalDistance(locations) {
  if (!locations || locations.length < 2) return 0;

  let totalDistance = 0;
  let lastValidPoint = null;

  for (let i = 0; i < locations.length; i++) {
    const curr = locations[i];
    
    if (!curr?.location?.coordinates) continue;

    if (!lastValidPoint) {
      lastValidPoint = curr;
      continue;
    }

    const from = turf.point(lastValidPoint.location.coordinates);
    const to = turf.point(curr.location.coordinates);
    const segmentDistance = turf.distance(from, to, { units: 'kilometers' });
    
    // Ignore impossible GPS jumps (e.g., > 150 km/h)
    if (lastValidPoint.timestamp && curr.timestamp) {
      const timeDiffHours = (new Date(curr.timestamp) - new Date(lastValidPoint.timestamp)) / (1000 * 60 * 60);
      if (timeDiffHours > 0) {
        const speedKmh = segmentDistance / timeDiffHours;
        if (speedKmh > MAX_SPEED_KMH) {
          continue; // Skip this impossible segment, keep lastValidPoint as the previous valid one
        }
      }
    }
    
    totalDistance += segmentDistance;
    lastValidPoint = curr;
  }

  return totalDistance;
}

module.exports = {
  calculateTotalDistance,
  MAX_SPEED_KMH
};
