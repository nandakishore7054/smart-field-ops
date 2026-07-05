const { z } = require('zod');

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const availabilitySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(timeRegex, 'Invalid start time format (HH:mm)'),
  endTime: z.string().regex(timeRegex, 'Invalid end time format (HH:mm)'),
  isRecurring: z.boolean().optional().default(true),
});

const availabilityInputSchema = z.object({
  availabilities: z.array(availabilitySchema),
});

const leaveTypeEnum = z.enum(['sick', 'personal', 'vacation', 'emergency']);

const leaveRequestInputSchema = z.object({
  type: leaveTypeEnum,
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  reason: z.string().trim().optional().default(''),
});

const leaveRequestApproveSchema = z.object({
  status: z.enum(['approved', 'rejected']),
});

function toValidationError(error) {
  const issues = error.flatten().fieldErrors;
  return {
    statusCode: 400,
    details: issues,
  };
}

function parseAvailabilityInput(body) {
  try {
    const parsed = availabilityInputSchema.parse(body);

    for (const avail of parsed.availabilities) {
      if (avail.startTime >= avail.endTime) {
        throw {
          statusCode: 400,
          details: { time: ['Start time must be before end time.'] },
        };
      }
    }

    return { success: true, data: parsed };
  } catch (error) {
    if (error.statusCode) return { success: false, error };
    return { success: false, error: toValidationError(error) };
  }
}

function parseLeaveRequestInput(body) {
  try {
    const parsed = leaveRequestInputSchema.parse(body);

    const now = new Date();
    // Reset time portion of now for date comparison
    now.setHours(0, 0, 0, 0);

    if (parsed.startDate < now) {
      throw {
        statusCode: 400,
        details: { startDate: ['Start date cannot be in the past.'] },
      };
    }

    if (parsed.endDate < parsed.startDate) {
      throw {
        statusCode: 400,
        details: { endDate: ['End date cannot be before start date.'] },
      };
    }

    return { success: true, data: parsed };
  } catch (error) {
    if (error.statusCode) return { success: false, error };
    return { success: false, error: toValidationError(error) };
  }
}

function parseLeaveRequestApprove(body) {
  try {
    const parsed = leaveRequestApproveSchema.parse(body);
    return { success: true, data: parsed };
  } catch (error) {
    return { success: false, error: toValidationError(error) };
  }
}

module.exports = {
  parseAvailabilityInput,
  parseLeaveRequestInput,
  parseLeaveRequestApprove,
};
