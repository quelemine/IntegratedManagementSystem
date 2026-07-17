const path = require('path');
require('dotenv').config();

module.exports = {
  development: {
    client: process.env.DB_CLIENT || 'pg',
    connection: process.env.DB_CLIENT === 'pg' ? {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    } : {
      filename: path.join(__dirname, 'server', 'database.sqlite3')
    },
    useNullAsDefault: true,
    migrations: {
      directory: path.join(__dirname, 'server', 'migrations')
    },
    seeds: {
      directory: path.join(__dirname, 'server', 'seeds')
    }
  },
  production: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    },
    migrations: {
      directory: path.join(__dirname, 'server', 'migrations')
    },
    seeds: {
      directory: path.join(__dirname, 'server', 'seeds')
    }
  }
};
