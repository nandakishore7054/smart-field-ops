const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('./auth.model');
const ApiError = require('../../core/utils/apiError');
const { environment } = require('../../config/environment');
const { sendEmail } = require('../../config/mailer');

function sanitizeUser(user) {
  const plainUser = user.toObject ? user.toObject() : { ...user };
  delete plainUser.password;
  delete plainUser.refreshToken;
  return plainUser;
}

function generateTokenPair(user) {
  const payload = {
    sub: user._id.toString(),
    role: user.role,
  };

  const accessToken = jwt.sign(payload, environment.accessTokenSecret, {
    expiresIn: environment.accessTokenExpiresIn,
  });

  const refreshToken = jwt.sign(payload, environment.refreshTokenSecret, {
    expiresIn: environment.refreshTokenExpiresIn,
  });

  return {
    accessToken,
    refreshToken,
  };
}

async function registerUser({ name, email, password, role }) {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, 'An account with this email already exists.');
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
  });

  const tokens = generateTokenPair(user);
  user.refreshToken = tokens.refreshToken;
  await user.save({ validateModifiedOnly: true });

  // Send Welcome Email (Non-blocking)
  sendEmail({
    to: user.email,
    subject: 'Welcome to Smart Field Operations',
    text: `Hi ${user.name},\n\nYour account has been created successfully.\n\nRole: ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}\n\nYou can now login and start using the system.\n\nRegards,\nSmart Field Operations Team`,
  }).catch((err) => {
    console.error('Failed to send welcome email:', err);
  });

  return {
    user: sanitizeUser(user),
    ...tokens,
  };
}

async function loginUser({ email, password }) {
  const user = await User.findOne({ email }).select('+password +refreshToken').populate('shiftId');

  if (!user) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const tokens = generateTokenPair(user);
  user.refreshToken = tokens.refreshToken;
  await user.save({ validateModifiedOnly: true });

  return {
    user: sanitizeUser(user),
    ...tokens,
  };
}

async function refreshUserSession(refreshToken) {
  if (!refreshToken) {
    throw new ApiError(401, 'Refresh token is required.');
  }

  let decoded;

  try {
    decoded = jwt.verify(refreshToken, environment.refreshTokenSecret);
  } catch (error) {
    throw new ApiError(401, 'Refresh token is invalid or expired.');
  }

  const user = await User.findById(decoded.sub).select('+refreshToken').populate('shiftId');

  if (!user || user.refreshToken !== refreshToken) {
    throw new ApiError(401, 'Refresh token is no longer valid.');
  }

  const tokens = generateTokenPair(user);
  user.refreshToken = tokens.refreshToken;
  await user.save({ validateModifiedOnly: true });

  return {
    user: sanitizeUser(user),
    ...tokens,
  };
}

async function forgotPassword(email) {
  const user = await User.findOne({ email });
  if (!user) return; // Fail silently for security

  const resetToken = crypto.randomBytes(20).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save({ validateModifiedOnly: true });

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

  await sendEmail({
    to: user.email,
    subject: 'Password Reset Request',
    text: `You requested a password reset.\n\nPlease click on the following link to reset your password:\n${resetUrl}\n\nIf you did not request this, please ignore this email.`,
  });
}

async function resetPassword(token, newPassword) {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  }).select('+resetPasswordToken +resetPasswordExpire +password');

  if (!user) {
    throw new ApiError(400, 'Invalid or expired password reset token.');
  }

  user.password = await bcrypt.hash(newPassword, 12);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save({ validateModifiedOnly: true });
}

module.exports = {
  registerUser,
  loginUser,
  refreshUserSession,
  forgotPassword,
  resetPassword,
};