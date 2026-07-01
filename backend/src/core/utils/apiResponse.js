function successResponse(res, statusCode, data) {
  return res.status(statusCode).json({
    status: 'success',
    data,
  });
}

module.exports = {
  successResponse,
};