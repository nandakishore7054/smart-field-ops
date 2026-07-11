const turf = require('@turf/turf');

const MAX_SPEED_KMH = 150;

/**
 * Filters out impossible GPS jumps (e.g., > 150 km/h) and returns a validated sequence.
 * @param {Array} locations - Array of location documents containing `.location.coordinates` as [lng, lat] and `.timestamp`.
 * @returns {Array} - Validated location documents.
 */
function filterValidLocations(locations) {
  if (!locations || locations.length === 0) return [];

  const validLocations = [];
  let lastValidPoint = null;

  for (let i = 0; i < locations.length; i++) {
    const curr = locations[i];
    
    if (!curr?.location?.coordinates) continue;

    if (!lastValidPoint) {
      lastValidPoint = curr;
      validLocations.push(curr);
      continue;
    }

    const from = turf.point(lastValidPoint.location.coordinates);
    const to = turf.point(curr.location.coordinates);
    const segmentDistance = turf.distance(from, to, { units: 'kilometers' });
    
    let isRejected = false;
    
    // Ignore impossible GPS jumps
    if (lastValidPoint.timestamp && curr.timestamp) {
      const timeDiffHours = (new Date(curr.timestamp) - new Date(lastValidPoint.timestamp)) / (1000 * 60 * 60);
      if (timeDiffHours > 0) {
        const speedKmh = segmentDistance / timeDiffHours;
        if (speedKmh > MAX_SPEED_KMH) {
          isRejected = true;
        }
      }
    }
    
    if (!isRejected) {
      validLocations.push(curr);
      lastValidPoint = curr;
    }
  }

  return validLocations;
}

/**
 * Calculates the total Haversine distance for an array of locations sequentially.
 * @param {Array} locations - Array of location documents containing `.location.coordinates` as [lng, lat] and `.timestamp`.
 * @returns {Number} - Total distance in kilometers.
 */
function calculateTotalDistance(locations) {
  const validLocations = filterValidLocations(locations);
  if (validLocations.length < 2) return 0;

  let totalDistance = 0;

  for (let i = 1; i < validLocations.length; i++) {
    const prev = validLocations[i - 1];
    const curr = validLocations[i];
    
    const from = turf.point(prev.location.coordinates);
    const to = turf.point(curr.location.coordinates);
    totalDistance += turf.distance(from, to, { units: 'kilometers' });
  }

  return totalDistance;
}

module.exports = {
  calculateTotalDistance,
  filterValidLocations,
  MAX_SPEED_KMH
};
