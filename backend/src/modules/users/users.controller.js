const asyncHandler = require('../../core/utils/asyncHandler');
const { successResponse } = require('../../core/utils/apiResponse');
const usersService = require('./users.service');
const ApiError = require('../../core/utils/apiError');

const listWorkers = asyncHandler(async (_request, response) => {
  const workers = await usersService.getActiveWorkers();
  return successResponse(response, 200, { workers });
});

const getUsers = asyncHandler(async (request, response) => {
  const { page, limit, search, role, status } = request.query;
  const data = await usersService.getUsers({ page, limit, search, role, status });
  return successResponse(response, 200, data);
});

const updateUserStatus = asyncHandler(async (request, response) => {
  const { status } = request.body;
  if (!status) throw new ApiError(400, 'Status is required');
  const user = await usersService.updateUserStatus(request.params.id, status);
  return successResponse(response, 200, { user });
});

const updateUserRole = asyncHandler(async (request, response) => {
  const { role } = request.body;
  if (!role) throw new ApiError(400, 'Role is required');
  const user = await usersService.updateUserRole(request.params.id, role);
  return successResponse(response, 200, { user });
});

const updateMyProfile = asyncHandler(async (request, response) => {
  const user = await usersService.updateMyProfile(request.user._id, request.body);
  return successResponse(response, 200, { user });
});

module.exports = {
  listWorkers,
  getUsers,
  updateUserStatus,
  updateUserRole,
  updateMyProfile
};