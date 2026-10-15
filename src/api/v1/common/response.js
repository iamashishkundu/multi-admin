const successResponse = (res, message = 'Success', data = null, statusCode = 200, pagination = null) => {
  const payload = {
    success: true,
    message,
    data,
  };

  if (pagination) {
    payload.pagination = pagination;
  }

  return res.status(statusCode).json(payload);
};

const createdResponse = (res, message = 'Resource created successfully', data = null) => {
  return successResponse(res, message, data, 201);
};

module.exports = {
  successResponse,
  createdResponse,
};
