const { z } = require('zod');

const pointSchema = z.object({
  type: z.literal('Point'),
  coordinates: z.tuple([
    z.number().min(-180).max(180), // Longitude
    z.number().min(-90).max(90),   // Latitude
  ]),
});

const polygonSchema = z.object({
  type: z.literal('Polygon'),
  coordinates: z.array(z.array(z.tuple([
    z.number().min(-180).max(180),
    z.number().min(-90).max(90),
  ]))).min(1).refine(coords => {
    // Basic validation: first and last coordinate of each ring must match
    for (const ring of coords) {
      if (ring.length < 4) return false;
      const first = ring[0];
      const last = ring[ring.length - 1];
      if (first[0] !== last[0] || first[1] !== last[1]) return false;
    }
    return true;
  }, 'First and last coordinates of a Polygon ring must match and contain at least 4 points.'),
});

const geofenceSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  type: z.enum(['polygon', 'circle']),
  category: z.enum(['office', 'customer', 'general']).optional().default('general'),
  boundary: polygonSchema.optional(),
  center: pointSchema.optional(),
  radius: z.number().positive('Radius must be greater than 0').optional(),
  rules: z.record(z.any()).optional().default({}),
  isActive: z.boolean().optional().default(true),
}).refine(data => {
  if (data.type === 'polygon' && !data.boundary) return false;
  if (data.type === 'circle' && (!data.center || !data.radius)) return false;
  return true;
}, {
  message: 'Polygons require a boundary. Circles require a center and radius.',
});

function toValidationError(error) {
  const issues = error.flatten().fieldErrors;
  return {
    statusCode: 400,
    details: issues,
  };
}

function parseGeofence(body) {
  try {
    const parsed = geofenceSchema.parse(body);
    return { success: true, data: parsed };
  } catch (error) {
    return { success: false, error: toValidationError(error) };
  }
}

module.exports = {
  parseGeofence,
};
