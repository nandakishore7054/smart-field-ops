const Task = require('./tasks.model');
const User = require('../auth/auth.model');
const ApiError = require('../../core/utils/apiError');

async function assertValidAssignee(assignedTo) {
  if (!assignedTo) {
    return null;
  }

  const worker = await User.findById(assignedTo).select('role status name email');

  if (!worker || worker.role !== 'worker' || worker.status !== 'active') {
    throw new ApiError(400, 'Assigned worker must be an active worker account.');
  }

  return worker._id;
}

function normalizeTaskDocument(task) {
  if (!task) {
    return null;
  }

  const plainTask = task.toObject ? task.toObject() : { ...task };
  return plainTask;
}

async function createTask(payload, actorId) {
  const assignedTo = await assertValidAssignee(payload.assignedTo || null);

  const task = await Task.create({
    title: payload.title,
    description: payload.description || '',
    priority: payload.priority,
    deadline: payload.deadline,
    locationAddress: payload.locationAddress || '',
    locationCoordinates: payload.locationCoordinates || null,
    assignedTo,
    createdBy: actorId,
    status: assignedTo ? 'assigned' : 'unassigned',
  });

  return normalizeTaskDocument(task);
}

async function getTasks({ page, limit, status, sort }) {
  const filter = { isDeleted: false };

  if (status) {
    filter.status = status;
  }

  const skip = (page - 1) * limit;

  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .populate('assignedTo', 'name email status role')
      .populate('createdBy', 'name email role')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Task.countDocuments(filter),
  ]);

  return {
    tasks,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      hasNextPage: skip + tasks.length < total,
      hasPrevPage: page > 1,
    },
  };
}

async function getMyTasks(workerId) {
  const tasks = await Task.find({
    assignedTo: workerId,
    isDeleted: false,
  })
    .populate('assignedTo', 'name email status role')
    .populate('createdBy', 'name email role')
    .sort({ deadline: 1, createdAt: -1 })
    .lean();

  return { tasks };
}

async function getTaskById(taskId) {
  const task = await Task.findOne({ _id: taskId, isDeleted: false })
    .populate('assignedTo', 'name email status role')
    .populate('createdBy', 'name email role')
    .lean();

  if (!task) {
    throw new ApiError(404, 'Task not found.');
  }

  return task;
}

async function updateTask(taskId, payload) {
  const task = await Task.findOne({ _id: taskId, isDeleted: false });

  if (!task) {
    throw new ApiError(404, 'Task not found.');
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'assignedTo')) {
    const assignedTo = await assertValidAssignee(payload.assignedTo || null);
    task.assignedTo = assignedTo;
    task.status = assignedTo ? 'assigned' : 'unassigned';
  }

  if (payload.title !== undefined) task.title = payload.title;
  if (payload.description !== undefined) task.description = payload.description;
  if (payload.priority !== undefined) task.priority = payload.priority;
  if (payload.deadline !== undefined) task.deadline = payload.deadline;
  if (payload.locationAddress !== undefined) task.locationAddress = payload.locationAddress;
  if (payload.locationCoordinates !== undefined) task.locationCoordinates = payload.locationCoordinates;
  if (payload.status !== undefined) task.status = payload.status;

  await task.save();
  return normalizeTaskDocument(task);
}

async function deleteTask(taskId) {
  const task = await Task.findOne({ _id: taskId, isDeleted: false });

  if (!task) {
    throw new ApiError(404, 'Task not found.');
  }

  task.isDeleted = true;
  task.deletedAt = new Date();
  await task.save();

  return normalizeTaskDocument(task);
}

async function updateTaskStatus(taskId, workerId, nextStatus) {
  const task = await Task.findOne({ _id: taskId, isDeleted: false });

  if (!task) {
    throw new ApiError(404, 'Task not found.');
  }

  if (!task.assignedTo || task.assignedTo.toString() !== workerId.toString()) {
    throw new ApiError(403, 'You can only update tasks assigned to you.');
  }

  if (task.status !== 'assigned' || nextStatus !== 'in-progress') {
    throw new ApiError(400, 'Invalid task status transition.');
  }

  task.status = nextStatus;
  await task.save();

  return normalizeTaskDocument(task);
}

module.exports = {
  createTask,
  getTasks,
  getMyTasks,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus,
};