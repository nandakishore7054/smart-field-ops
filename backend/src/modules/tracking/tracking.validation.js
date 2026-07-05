const { z } = require('zod');

const locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().optional(),
  speed: z.number().optional(),
  heading: z.number().optional(),
  batteryLevel: z.number().min(0).max(100).optional(),
  isMoving: z.boolean().optional(),
  timestamp: z.coerce.date().optional(),
});

function toValidationError(error) {
  const issues = error.flatten().fieldErrors;
  return {
    statusCode: 400,
    details: issues,
  };
}

function parseLocation(body) {
  try {
    const parsed = locationSchema.parse(body);
    return { success: true, data: parsed };
  } catch (error) {
    return { success: false, error: toValidationError(error) };
  }
}

module.exports = {
  parseLocation,
};
