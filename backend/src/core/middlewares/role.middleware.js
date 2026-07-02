const ApiError = require('../utils/apiError');

function requireRoles(...allowedRoles) {
  return function roleGuard(request, _response, next) {
    if (!request.user) {
      return next(new ApiError(401, 'Authentication is required.'));
    }

    if (!allowedRoles.includes(request.user.role)) {
      return next(new ApiError(403, 'You do not have permission to access this resource.'));
    }

    return next();
  };
}

module.exports = requireRoles;