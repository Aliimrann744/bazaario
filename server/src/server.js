'use strict';
const app = require('./app');
const config = require('./config');
const prisma = require('./db/prisma');

async function start() {
  try {
    await prisma.$connect();
    // Schema is managed by Prisma Migrate — run `npm run prisma:migrate` (dev)
    // or `npm run prisma:deploy` (prod), then `npm run seed`.
    app.listen(config.port, () => {
      // eslint-disable-next-line no-console
      console.log(`\n  Bazaario API listening on http://localhost:${config.port}`);
      console.log(`  Health:  http://localhost:${config.port}/health`);
      console.log(`  DB:      PostgreSQL via Prisma\n`);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to start server:', err);
    console.error('Is PostgreSQL running and DATABASE_URL correct? Did you run migrations?');
    process.exit(1);
  }
}

async function shutdown() {
  await prisma.$disconnect();
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start();
