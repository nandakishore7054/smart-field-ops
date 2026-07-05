const jwt = require('jsonwebtoken');
const User = require('../../modules/auth/auth.model');
const ApiError = require('../utils/apiError');
const { environment } = require('../../config/environment');

async function protect(request, _response, next) {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Access token is required.'));
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, environment.accessTokenSecret);
    const user = await User.findById(decoded.sub).select('-password -refreshToken').populate('shiftId');

    if (!user) {
      return next(new ApiError(401, 'The authenticated user no longer exists.'));
    }

    request.user = user;
    return next();
  } catch (error) {
    return next(new ApiError(401, 'Your session has expired. Please sign in again.'));
  }
}

module.exports = {
  protect,
};