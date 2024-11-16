import winston from "winston";

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'backup.log' }),
    ],
});

module.exports = logger;