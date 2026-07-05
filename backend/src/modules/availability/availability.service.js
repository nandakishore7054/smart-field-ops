const WorkerAvailability = require('./availability.model');
const LeaveRequest = require('./leaveRequest.model');
const User = require('../auth/auth.model');
const { createNotification } = require('../notifications/notifications.service');
const { sendEmail } = require('../../config/mailer');
const ApiError = require('../../core/utils/apiError');

async function setAvailability(workerId, availabilities) {
  // Delete existing availabilities for this worker
  await WorkerAvailability.deleteMany({ workerId });

  // Insert new ones
  const docs = availabilities.map((avail) => ({
    workerId,
    ...avail,
  }));
  
  if (docs.length > 0) {
    await WorkerAvailability.insertMany(docs);
  }

  // Socket notification
  if (global.io) {
    global.io.emit('availability:updated', { workerId, windows: availabilities });
  }

  return { success: true };
}

async function getAvailability(workerId) {
  const availabilities = await WorkerAvailability.find({ workerId }).lean();
  return availabilities;
}

async function getAllAvailabilities() {
  const availabilities = await WorkerAvailability.find().lean();
  return availabilities;
}

async function submitLeaveRequest(workerId, data) {
  const worker = await User.findById(workerId);
  if (!worker) throw new ApiError(404, 'Worker not found.');

  // Check overlap with pending/approved leaves
  const existing = await LeaveRequest.findOne({
    workerId,
    status: { $in: ['pending', 'approved'] },
    $or: [
      { startDate: { $lte: data.endDate }, endDate: { $gte: data.startDate } }
    ],
  });

  if (existing) {
    throw new ApiError(400, 'Leave request overlaps with an existing pending or approved request.');
  }

  const leaveRequest = await LeaveRequest.create({
    workerId,
    ...data,
  });

  // Notify admin
  const admins = await User.find({ role: 'admin' });
  for (const admin of admins) {
    await createNotification({
      userId: admin._id,
      message: `New leave request from ${worker.name}`,
      type: 'leave_request',
    });
    if (global.io) {
      global.io.to(admin._id.toString()).emit('leave:requested', { leaveRequest, worker });
    }
  }

  return leaveRequest;
}

async function getLeaveRequests(query = {}) {
  const requests = await LeaveRequest.find()
    .populate('workerId', 'name email avatarUrl')
    .populate('approvedBy', 'name email')
    .sort({ createdAt: -1 })
    .lean();
  return requests;
}

async function getWorkerLeaveRequests(workerId) {
  const requests = await LeaveRequest.find({ workerId })
    .populate('approvedBy', 'name email')
    .sort({ createdAt: -1 })
    .lean();
  return requests;
}

async function approveLeaveRequest(requestId, adminId, status) {
  const leaveRequest = await LeaveRequest.findById(requestId).populate('workerId', 'name email');
  if (!leaveRequest) throw new ApiError(404, 'Leave request not found.');

  leaveRequest.status = status;
  leaveRequest.approvedBy = adminId;
  await leaveRequest.save();

  const admin = await User.findById(adminId);

  // Notify worker
  await createNotification({
    userId: leaveRequest.workerId._id,
    message: `Your leave request has been ${status}`,
    type: status === 'approved' ? 'leave_approved' : 'leave_rejected',
  });

  if (global.io) {
    global.io.to(leaveRequest.workerId._id.toString()).emit('leave:approved', { leaveRequest, approvedBy: admin });
  }

  // Email worker
  await sendEmail({
    to: leaveRequest.workerId.email,
    subject: `Leave Request ${status === 'approved' ? 'Approved' : 'Rejected'}`,
    text: `Your leave request from ${leaveRequest.startDate.toDateString()} to ${leaveRequest.endDate.toDateString()} has been ${status}.`,
  });

  return leaveRequest;
}

module.exports = {
  setAvailability,
  getAvailability,
  getAllAvailabilities,
  submitLeaveRequest,
  getLeaveRequests,
  getWorkerLeaveRequests,
  approveLeaveRequest,
};
