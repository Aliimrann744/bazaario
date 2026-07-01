'use strict';
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config');
const prisma = require('./db/prisma');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));

const corsOptions = {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json({ limit: '2mb' }));
app.use(morgan(config.env === 'production' ? 'combined' : 'dev'));

// Health
app.get('/health', async (req, res) => {
  let db = 'ok';
  try { await prisma.$queryRaw`SELECT 1`; } catch { db = 'down'; }
  res.json({ ok: true, db, service: 'bazaario-api', time: new Date().toISOString() });
});

// API v1
const v1 = express.Router();
v1.use('/auth', require('./modules/auth/auth.routes'));
v1.use(require('./modules/users/users.routes'));
v1.use(require('./modules/categories/categories.routes'));
v1.use(require('./modules/locations/locations.routes'));
v1.use(require('./modules/reference/reference.routes'));
v1.use(require('./modules/listings/listings.routes'));
v1.use(require('./modules/search/search.routes'));
v1.use(require('./modules/favourites/favourites.routes'));
v1.use(require('./modules/conversations/conversations.routes'));
v1.use(require('./modules/reports/reports.routes'));

app.use('/v1', v1);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
