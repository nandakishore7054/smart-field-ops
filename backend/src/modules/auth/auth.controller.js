const authService = require('./auth.service');
const ApiError = require('../../core/utils/apiError');
const asyncHandler = require('../../core/utils/asyncHandler');
const { successResponse } = require('../../core/utils/apiResponse');
const { validateLoginInput, validateRegistrationInput } = require('./auth.validation');

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
};

function setRefreshTokenCookie(response, refreshToken) {
  response.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

const register = asyncHandler(async (request, response) => {
  const validation = validateRegistrationInput(request.body);

  if (!validation.isValid) {
    throw new ApiError(400, 'Registration validation failed.', validation.errors);
  }

  const result = await authService.registerUser(validation.value);
  setRefreshTokenCookie(response, result.refreshToken);

  return successResponse(response, 201, {
    user: result.user,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });
});

const login = asyncHandler(async (request, response) => {
  const validation = validateLoginInput(request.body);

  if (!validation.isValid) {
    throw new ApiError(400, 'Login validation failed.', validation.errors);
  }

  const result = await authService.loginUser(validation.value);
  setRefreshTokenCookie(response, result.refreshToken);

  return successResponse(response, 200, {
    user: result.user,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });
});

const refreshToken = asyncHandler(async (request, response) => {
  const token = request.cookies?.refreshToken || request.body?.refreshToken;
  const result = await authService.refreshUserSession(token);
  setRefreshTokenCookie(response, result.refreshToken);

  return successResponse(response, 200, {
    user: result.user,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });
});

const me = asyncHandler(async (request, response) =>
  successResponse(response, 200, {
    user: request.user,
  })
);

module.exports = {
  register,
  login,
  refreshToken,
  me,
};