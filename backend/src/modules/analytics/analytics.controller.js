const asyncHandler = require('../../core/utils/asyncHandler');
const { successResponse } = require('../../core/utils/apiResponse');
const analyticsService = require('./analytics.service');

const getSummary = asyncHandler(async (request, response) => {
  const data = await analyticsService.getSummary();
  return successResponse(response, 200, data);
});

const getWorkerStats = asyncHandler(async (request, response) => {
  const data = await analyticsService.getWorkerStats(request.params.id);
  return successResponse(response, 200, data);
});

module.exports = {
  getSummary,
  getWorkerStats,
};
