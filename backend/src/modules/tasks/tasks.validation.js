const { z } = require('zod');

const objectIdPattern = /^[a-f\d]{24}$/i;

const taskStatusEnum = z.enum(['unassigned', 'assigned', 'in-progress', 'completed', 'verified']);
const priorityEnum = z.enum(['low', 'medium', 'high', 'urgent']);

const coordinatesSchema = z
  .object({
    type: z.literal('Point'),
    coordinates: z.tuple([z.number(), z.number()]),
  })
  .optional();

const taskInputSchema = z.object({
  title: z.string().trim().min(1, 'Title is required.'),
  description: z.string().trim().optional().default(''),
  priority: priorityEnum.default('medium'),
  deadline: z.coerce.date(),
  locationAddress: z.string().trim().optional().default(''),
  locationCoordinates: coordinatesSchema,
  assignedTo: z
    .string()
    .trim()
    .regex(objectIdPattern, 'Assigned worker must be a valid user id.')
    .nullable()
    .optional(),
  status: taskStatusEnum.optional(),
});

const taskUpdateSchema = z.object({
  title: z.string().trim().min(1, 'Title is required.').optional(),
  description: z.string().trim().optional(),
  priority: priorityEnum.optional(),
  deadline: z.coerce.date().optional(),
  locationAddress: z.string().trim().optional(),
  locationCoordinates: coordinatesSchema,
  assignedTo: z
    .string()
    .trim()
    .regex(objectIdPattern, 'Assigned worker must be a valid user id.')
    .nullable()
    .optional(),
  status: taskStatusEnum.optional(),
});

const taskQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  status: taskStatusEnum.optional(),
  search: z.string().trim().optional(),
  priority: priorityEnum.optional(),
  sort: z.string().trim().optional().default('-createdAt'),
});

function toValidationError(error) {
  const issues = error.flatten().fieldErrors;
  return {
    statusCode: 400,
    details: issues,
  };
}

function parseTaskInput(body) {
  try {
    const parsed = taskInputSchema.parse(body);

    if (parsed.deadline.getTime() <= Date.now()) {
      throw {
        statusCode: 400,
        details: { deadline: ['Deadline must be in the future.'] },
      };
    }

    return { success: true, data: parsed };
  } catch (error) {
    if (error.statusCode) {
      return { success: false, error };
    }

    return { success: false, error: toValidationError(error) };
  }
}

function parseTaskUpdate(body) {
  try {
    const parsed = taskUpdateSchema.parse(body);

    if (parsed.deadline && parsed.deadline.getTime() <= Date.now()) {
      throw {
        statusCode: 400,
        details: { deadline: ['Deadline must be in the future.'] },
      };
    }

    return { success: true, data: parsed };
  } catch (error) {
    if (error.statusCode) {
      return { success: false, error };
    }

    return { success: false, error: toValidationError(error) };
  }
}

function parseTaskQuery(query) {
  try {
    return { success: true, data: taskQuerySchema.parse(query) };
  } catch (error) {
    return { success: false, error: toValidationError(error) };
  }
}

module.exports = {
  parseTaskInput,
  parseTaskUpdate,
  parseTaskQuery,
};