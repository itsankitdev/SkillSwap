class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Distinguishes our errors from unexpected crashes
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;