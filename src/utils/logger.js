const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    transports: [
      new winston.transports.File({ filename: 'logs/backup.log', level: 'info' }),
  
      new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
  
      // Optional log to console in development
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        ),
      }),
    ],
  });
  
  /**
   * Logs a backup activity.
   * @param {string} message - Log message.
   * @param {string} level - Log level (info, error, warn).
   */
  function logMessage(message, level = 'info') {
    logger.log({ level, message });
  }
  
  /**
   * Logs an error with additional details.
   * @param {Error} error - Error object.
   */
  function logError(error) {
    logger.error(error.stack || error.message);
  }
  
  module.exports = { logMessage, logError, logger };