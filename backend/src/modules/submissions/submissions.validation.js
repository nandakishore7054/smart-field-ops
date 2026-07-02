const { z } = require('zod');

const objectIdPattern = /^[a-f\d]{24}$/i;

const geoPointSchema = z.object({
  type: z.literal('Point'),
  coordinates: z.tuple([z.number(), z.number()]),
});

const submissionCreateSchema = z.object({
  taskId: z.string().regex(objectIdPattern, 'Task id is required.'),
  images: z.array(z.string().url()).min(1, 'At least one image is required.'),
  notes: z.string().trim().optional().default(''),
  submittedLocation: geoPointSchema,
});

const submissionVerifySchema = z.object({
  isVerified: z.boolean(),
  verificationFeedback: z.string().trim().optional().default(''),
});

function parseSubmissionCreate(body) {
  try {
    return { success: true, data: submissionCreateSchema.parse(body) };
  } catch (error) {
    return {
      success: false,
      error: {
        statusCode: 400,
        details: error.flatten ? error.flatten().fieldErrors : { message: 'Invalid submission data.' },
      },
    };
  }
}

function parseSubmissionVerify(body) {
  try {
    return { success: true, data: submissionVerifySchema.parse(body) };
  } catch (error) {
    return {
      success: false,
      error: {
        statusCode: 400,
        details: error.flatten ? error.flatten().fieldErrors : { message: 'Invalid verification data.' },
      },
    };
  }
}

module.exports = {
  parseSubmissionCreate,
  parseSubmissionVerify,
};