const asyncHandler = require('../../core/utils/asyncHandler');
const { successResponse } = require('../../core/utils/apiResponse');
const aiService = require('./ai.service');

const getOperationsSummary = asyncHandler(async (req, res) => {
  const forceRefresh = req.query.refresh === 'true';
  const data = await aiService.getOperationsSummary(forceRefresh);
  return successResponse(res, 200, data);
});

module.exports = {
  getOperationsSummary
};
