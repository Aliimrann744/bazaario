'use strict';

class ApiError extends Error {
  constructor(status, code, message, fields) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields; // optional { fieldPath: message }
  }
  static badRequest(message, fields) { return new ApiError(400, 'BAD_REQUEST', message, fields); }
  static unauthorized(message = 'Authentication required') { return new ApiError(401, 'UNAUTHORIZED', message); }
  static forbidden(message = 'Not allowed') { return new ApiError(403, 'FORBIDDEN', message); }
  static notFound(message = 'Not found') { return new ApiError(404, 'NOT_FOUND', message); }
  static conflict(message, fields) { return new ApiError(409, 'CONFLICT', message, fields); }
  static validation(fields, message = 'Validation failed') { return new ApiError(422, 'VALIDATION_ERROR', message, fields); }
}

module.exports = ApiError;
