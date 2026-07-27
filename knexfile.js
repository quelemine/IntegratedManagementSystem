const path = require('path');
require('dotenv').config();

module.exports = {
  development: {
    client: process.env.DB_CLIENT || 'pg',
    connection: process.env.DATABASE_URL || {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'integrated_management_system',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres'
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
    connection: process.env.DATABASE_URL || {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
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
