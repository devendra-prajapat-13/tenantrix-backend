import jwt from "jsonwebtoken";
import { errorResponse } from "../utils/helper/apiResponse.js";
import { STATUS_CODES } from "../utils/helper/statusCodes.js";

export const auth = async (req, res, next) => {
  try {
    // get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return errorResponse(
        res,
        STATUS_CODES.UNAUTHORIZED,
        "Access denied. No token provided."
      );
    }

    //  extract token
    const token = authHeader.split(" ")[1];

    //  verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // attach decoded user info to request
    req.user = decoded; 

    next();
  } catch (err) {
    console.error(err);

    return errorResponse(
      res,
      STATUS_CODES.UNAUTHORIZED,
      "Invalid or expired token"
    );
  }
};