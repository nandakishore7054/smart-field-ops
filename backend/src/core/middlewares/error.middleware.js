function formatValidationDetails(details) {
  if (!details) {
    return null;
  }

  if (typeof details === 'string') {
    return { message: details };
  }

  return details;
}

function errorMiddleware(error, _request, response, _next) {
  const statusCode = error.statusCode || 500;
  const details = formatValidationDetails(error.details);

  if (details) {
    return response.status(statusCode).json({
      status: 'fail',
      data: details,
    });
  }

  if (statusCode < 500) {
    return response.status(statusCode).json({
      status: 'error',
      message: error.message || 'Request failed.',
    });
  }

  console.error(error);

  return response.status(500).json({
    status: 'error',
    message: 'Internal server error.',
  });
}

module.exports = errorMiddleware;