const asyncHandler = require('../../core/utils/asyncHandler');
const ApiError = require('../../core/utils/apiError');
const { successResponse } = require('../../core/utils/apiResponse');
const tasksService = require('./tasks.service');
const { parseTaskInput, parseTaskUpdate, parseTaskQuery } = require('./tasks.validation');

function sendValidationFailure(error, message) {
  throw new ApiError(error.statusCode || 400, message, error.details || error);
}

const createTask = asyncHandler(async (request, response) => {
  const result = parseTaskInput(request.body);

  if (!result.success) {
    sendValidationFailure(result.error, 'Task validation failed.');
  }

  const task = await tasksService.createTask(result.data, request.user._id);

  return successResponse(response, 201, { task });
});

const listTasks = asyncHandler(async (request, response) => {
  const result = parseTaskQuery(request.query);

  if (!result.success) {
    sendValidationFailure(result.error, 'Task query validation failed.');
  }

  const data = await tasksService.getTasks(result.data);

  return successResponse(response, 200, data);
});

const getTaskById = asyncHandler(async (request, response) => {
  const task = await tasksService.getTaskById(request.params.id);

  return successResponse(response, 200, { task });
});

const updateTask = asyncHandler(async (request, response) => {
  const result = parseTaskUpdate(request.body);

  if (!result.success) {
    sendValidationFailure(result.error, 'Task update validation failed.');
  }

  const task = await tasksService.updateTask(request.params.id, result.data);

  return successResponse(response, 200, { task });
});

const deleteTask = asyncHandler(async (request, response) => {
  const task = await tasksService.deleteTask(request.params.id);

  return successResponse(response, 200, { task });
});

module.exports = {
  createTask,
  listTasks,
  getTaskById,
  updateTask,
  deleteTask,
};