#!/usr/bin/env node

/**
 * Database Migration Script for Cloud Deployment
 * Run this after deploying to Render/Railway to set up the database
 */

const { exec } = require('child_process');
const path = require('path');

console.log('Starting database migrations...');

const migrateCommand = 'npx knex migrate:latest --knexfile server/knexfile.js';

exec(migrateCommand, { cwd: path.join(__dirname, '..') }, (error, stdout, stderr) => {
  if (error) {
    console.error(`Migration failed: ${error.message}`);
    process.exit(1);
  }
  
  if (stderr) {
    console.error(`Migration stderr: ${stderr}`);
  }
  
  console.log(`Migration output:\n${stdout}`);
  console.log('Database migrations completed successfully!');
});
