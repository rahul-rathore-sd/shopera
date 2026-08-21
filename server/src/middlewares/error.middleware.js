import { ApiError } from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {
  let error = err;

  // Log unexpected errors on the server for debugging
  const statusCode = err.statusCode || (err instanceof ApiError ? err.statusCode : 500);
  if (statusCode >= 500) {
    console.error("❌ [Server Error]:", err?.message || err);
    if (err?.stack) console.error(err.stack);
  } else if (statusCode !== 401 && statusCode !== 404) {
    console.warn(`⚠️ [API Warning ${statusCode}]:`, err?.message || err);
  }

  // Handle Mongoose / MongoDB Specific Errors
  if (err.name === "CastError") {
    error = new ApiError(400, `Invalid resource identifier: ${err.path}`);
  } else if (err.name === "ValidationError") {
    const messages = Object.values(err.errors || {}).map((e) => e.message);
    error = new ApiError(400, messages.join(", ") || "Validation Error", messages);
  } else if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    error = new ApiError(409, `Duplicate value entered for ${field}`);
  } else if (err.name === "JsonWebTokenError") {
    error = new ApiError(401, "Invalid access token");
  } else if (err.name === "TokenExpiredError") {
    error = new ApiError(401, "Access token has expired");
  } else if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    error = new ApiError(statusCode, message, error?.errors || []);
  }

  const response = {
    success: false,
    message: error.message,
    errors: error.errors,
    ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}),
  };

  return res.status(error.statusCode || 500).json(response);
};

export { errorHandler };