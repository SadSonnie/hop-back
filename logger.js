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
  logger.info(
    `Request: ${req.method} /api${req.url}; user - ${req.userId}; body - ${JSON.stringify(req.body)};`,
  );
};

module.exports = {
  requestLog,
  logger,
};
