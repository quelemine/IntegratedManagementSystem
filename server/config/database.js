const knex = require('knex');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const db = knex({
  client: process.env.DB_CLIENT || 'pg',
  connection: process.env.DB_CLIENT === 'pg' ? {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  } : {
    filename: process.env.DB_FILE || './server/database.sqlite3'
  },
  useNullAsDefault: true,
  pool: {
    min: 0,
    max: 10,
    acquireTimeoutMillis: 30000,
    idleTimeoutMillis: 30000
  }
});

module.exports = db;
