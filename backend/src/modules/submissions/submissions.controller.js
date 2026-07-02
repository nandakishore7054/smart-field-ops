const asyncHandler = require('../../core/utils/asyncHandler');
const ApiError = require('../../core/utils/apiError');
const { successResponse } = require('../../core/utils/apiResponse');
const { parseSubmissionCreate, parseSubmissionVerify } = require('./submissions.validation');
const submissionsService = require('./submissions.service');

const uploadSignature = asyncHandler(async (_request, response) => {
  const payload = await submissionsService.getUploadSignature();
  return successResponse(response, 200, payload);
});

const createSubmission = asyncHandler(async (request, response) => {
  const result = parseSubmissionCreate(request.body);

  if (!result.success) {
    throw new ApiError(result.error.statusCode || 400, 'Submission validation failed.', result.error.details);
  }

  const payload = result.data;
  const created = await submissionsService.createSubmission(payload, request.user._id);
  return successResponse(response, 201, created);
});

const verifySubmission = asyncHandler(async (request, response) => {
  const result = parseSubmissionVerify(request.body);

  if (!result.success) {
    throw new ApiError(result.error.statusCode || 400, 'Verification validation failed.', result.error.details);
  }

  const updated = await submissionsService.verifySubmission(request.params.id, request.user._id, result.data);
  return successResponse(response, 200, updated);
});

module.exports = {
  uploadSignature,
  createSubmission,
  verifySubmission,
};