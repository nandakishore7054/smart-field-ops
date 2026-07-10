const asyncHandler = require('../../core/utils/asyncHandler');
const { successResponse } = require('../../core/utils/apiResponse');
const dashboardService = require('./dashboard.service');

const getDashboardAnalytics = asyncHandler(async (req, res) => {
  const data = await dashboardService.getDashboardAnalytics();
  return successResponse(res, 200, data);
});

module.exports = {
  getDashboardAnalytics
};
