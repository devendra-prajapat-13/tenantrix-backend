export const successResponse = (
  res,
  statusCode,
  message,
  data = {},
  extra = {},
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...data,
    ...extra,
  });
};

export const errorResponse = (res, statusCode, message) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};
