'use strict';
require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  // Prisma reads DATABASE_URL directly from the environment (see prisma/schema.prisma).
  databaseUrl: process.env.DATABASE_URL || '',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev_access_secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret',
    accessTtl: parseInt(process.env.ACCESS_TOKEN_TTL || '900', 10), // seconds
    refreshTtl: parseInt(process.env.REFRESH_TOKEN_TTL || '2592000', 10),
  },
  corsOrigins: (process.env.CORS_ORIGINS),
  listingExpiryDays: 30,
};

if (!config.databaseUrl) {
  // eslint-disable-next-line no-console
  console.warn('\n  ⚠  DATABASE_URL is not set. Copy .env.example to .env and set your PostgreSQL connection string.\n');
}

module.exports = config;
