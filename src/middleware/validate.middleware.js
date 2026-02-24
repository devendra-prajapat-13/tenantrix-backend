import { errorResponse } from "../utils/helper/apiResponse.js";
import { STATUS_CODES } from "../utils/helper/statusCodes.js";

export const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    const message = error.details.map((err) => err.message).join(", ");
    return errorResponse(res, STATUS_CODES.BAD_REQUEST, message);
  }
  next();
};
