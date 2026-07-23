/**
 * Logging utility for the application
 * Provides structured logging with different levels
 */

const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '../../logs');
const LOG_FILE = path.join(LOG_DIR, 'app.log');
const ERROR_LOG_FILE = path.join(LOG_DIR, 'error.log');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const logLevels = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

/**
 * Format log entry
 */
const formatLogEntry = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...meta
  };
  return JSON.stringify(logEntry);
};

/**
 * Write to log file
 */
const writeToFile = (logEntry, isError = false) => {
  const file = isError ? ERROR_LOG_FILE : LOG_FILE;
  fs.appendFileSync(file, logEntry + '\n', 'utf8');
};

/**
 * Log error
 */
const error = (message, meta = {}) => {
  const logEntry = formatLogEntry(logLevels.ERROR, message, meta);
  console.error(logEntry);
  writeToFile(logEntry, true);
};

/**
 * Log warning
 */
const warn = (message, meta = {}) => {
  const logEntry = formatLogEntry(logLevels.WARN, message, meta);
  console.warn(logEntry);
  writeToFile(logEntry);
};

/**
 * Log info
 */
const info = (message, meta = {}) => {
  const logEntry = formatLogEntry(logLevels.INFO, message, meta);
  console.log(logEntry);
  writeToFile(logEntry);
};

/**
 * Log debug (only in development)
 */
const debug = (message, meta = {}) => {
  if (process.env.NODE_ENV === 'development') {
    const logEntry = formatLogEntry(logLevels.DEBUG, message, meta);
    console.log(logEntry);
    writeToFile(logEntry);
  }
};

/**
 * Log API request
 */
const logRequest = (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    };
    
    if (res.statusCode >= 400) {
      error('API Request Failed', logData);
    } else {
      info('API Request', logData);
    }
  });
  
  next();
};

module.exports = {
  error,
  warn,
  info,
  debug,
  logRequest
};
