const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./auth.model');
const ApiError = require('../../core/utils/apiError');
const { environment } = require('../../config/environment');

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

  return {
    user: sanitizeUser(user),
    ...tokens,
  };
}

async function loginUser({ email, password }) {
  const user = await User.findOne({ email }).select('+password +refreshToken');

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

  const user = await User.findById(decoded.sub).select('+refreshToken');

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

module.exports = {
  registerUser,
  loginUser,
  refreshUserSession,
};