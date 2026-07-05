const { z } = require('zod');

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/; // HH:mm

const locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

const checkInSchema = z.object({
  location: locationSchema.optional(), // location is optional in case GPS fails and we allow manual check-in
  method: z.enum(['gps', 'manual']).default('gps'),
});

const checkOutSchema = z.object({
  location: locationSchema.optional(),
  method: z.enum(['gps', 'manual']).default('gps'),
});

const shiftSchema = z.object({
  name: z.string().trim().min(1, 'Shift name is required'),
  startTime: z.string().regex(timeRegex, 'Invalid start time format (HH:mm)'),
  endTime: z.string().regex(timeRegex, 'Invalid end time format (HH:mm)'),
  gracePeriodMinutes: z.number().int().min(0).default(15),
  workers: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId')).optional().default([]),
  isActive: z.boolean().optional().default(true),
});

const manualCorrectionSchema = z.object({
  checkInTime: z.coerce.date().optional(),
  checkOutTime: z.coerce.date().optional(),
  status: z.enum(['present', 'absent', 'late', 'half-day', 'on-leave']).optional(),
  totalHours: z.number().min(0).optional(),
});

function toValidationError(error) {
  const issues = error.flatten().fieldErrors;
  return {
    statusCode: 400,
    details: issues,
  };
}

function parseCheckIn(body) {
  try {
    const parsed = checkInSchema.parse(body);
    return { success: true, data: parsed };
  } catch (error) {
    return { success: false, error: toValidationError(error) };
  }
}

function parseCheckOut(body) {
  try {
    const parsed = checkOutSchema.parse(body);
    return { success: true, data: parsed };
  } catch (error) {
    return { success: false, error: toValidationError(error) };
  }
}

function parseShift(body) {
  try {
    const parsed = shiftSchema.parse(body);
    return { success: true, data: parsed };
  } catch (error) {
    return { success: false, error: toValidationError(error) };
  }
}

function parseManualCorrection(body) {
  try {
    const parsed = manualCorrectionSchema.parse(body);
    return { success: true, data: parsed };
  } catch (error) {
    return { success: false, error: toValidationError(error) };
  }
}

module.exports = {
  parseCheckIn,
  parseCheckOut,
  parseShift,
  parseManualCorrection,
};
