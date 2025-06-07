const winston = require("winston");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}]: ${message}`;
    }),
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs/api.log" }),
  ],
});

const requestLog = (req) => {
  const bodyLog = req.method === 'GET' ? '' : `; body - ${JSON.stringify(req.body)}`;
  logger.info(`${req.method} ${req.url}${bodyLog}`);
};

module.exports = {
  requestLog,
  logger,
};
