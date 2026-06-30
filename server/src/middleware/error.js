'use strict';
const crypto = require('crypto');
const ApiError = require('../utils/apiError');

function notFound(req, res, next) {
  next(ApiError.notFound(`Route ${req.method} ${req.path} not found`));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const correlationId = crypto.randomBytes(6).toString('hex');
  let status = err.status || 500;
  let code = err.code || 'INTERNAL_ERROR';
  let message = err.message || 'Something went wrong';
  let fields = err.fields;

  // Prisma known request errors
  if (err.code === 'P2002') {
    status = 409; code = 'CONFLICT';
    message = 'A record with these details already exists';
    fields = {};
    const targets = (err.meta && err.meta.target) || [];
    (Array.isArray(targets) ? targets : [targets]).forEach((t) => { fields[t] = `${t} already in use`; });
  } else if (err.code === 'P2025') {
    status = 404; code = 'NOT_FOUND'; message = 'Record not found';
  } else if (err.code === 'P2003') {
    status = 400; code = 'BAD_REQUEST'; message = 'Related record does not exist';
  }

  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error(`[${correlationId}]`, err);
  }
  res.status(status).json({ error: { code, message, fields, correlationId } });
}

module.exports = { notFound, errorHandler };
