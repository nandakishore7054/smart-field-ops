const asyncHandler = require('../../core/utils/asyncHandler');
const { successResponse } = require('../../core/utils/apiResponse');
const usersService = require('./users.service');

const listWorkers = asyncHandler(async (_request, response) => {
  const workers = await usersService.getActiveWorkers();

  return successResponse(response, 200, {
    workers,
  });
});

module.exports = {
  listWorkers,
};