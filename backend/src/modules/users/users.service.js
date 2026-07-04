const User = require('./users.model');
const bcrypt = require('bcryptjs');
const ApiError = require('../../core/utils/apiError');

async function getActiveWorkers() {
  return User.find({ role: 'worker', status: 'active' })
    .select('name email role status avatarUrl phone createdAt updatedAt')
    .sort({ name: 1 })
    .lean();
}

async function getUsers({ page = 1, limit = 10, search = '', role, status }) {
  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  if (role) query.role = role;
  if (status) query.status = status;

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find(query)
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    User.countDocuments(query)
  ]);

  return {
    users,
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / limit)
  };
}

async function updateUserStatus(userId, status) {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  user.status = status;
  await user.save();
  const plainUser = user.toObject();
  delete plainUser.password;
  delete plainUser.refreshToken;
  return plainUser;
}

async function updateUserRole(userId, role) {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  user.role = role;
  await user.save();
  const plainUser = user.toObject();
  delete plainUser.password;
  delete plainUser.refreshToken;
  return plainUser;
}

async function updateMyProfile(userId, payload) {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (payload.name) user.name = payload.name;
  if (payload.phone !== undefined) user.phone = payload.phone;
  if (payload.avatarUrl !== undefined) user.avatarUrl = payload.avatarUrl;
  
  if (payload.password) {
    user.password = await bcrypt.hash(payload.password, 12);
  }

  await user.save();
  const plainUser = user.toObject();
  delete plainUser.password;
  delete plainUser.refreshToken;
  return plainUser;
}

module.exports = {
  getActiveWorkers,
  getUsers,
  updateUserStatus,
  updateUserRole,
  updateMyProfile
};