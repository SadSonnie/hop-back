const ApiError = require("../exceptions/apiError");
const { logger } = require("../logger");

module.exports = (err, req, res, next) => {
  if (err instanceof ApiError) {
    logger.error(
      `Request: ${req.method} ${req.url}; message - ${err.message}; user - ${req.userId}; body - ${JSON.stringify(req.body)};`,
      {
        status: err.status,
        errors: err.errors,
      },
    );

    return res
      .status(err.status)
      .json({ message: err.message, errors: err.errors });
  }

  logger.error(
    `Unexpected error; Request: ${req.method} ${req.url}; user - ${req.userId}; body - ${JSON.stringify(req.body)};`,
    {
      message: err.message,
      stack: err.stack,
    },
  );

  return res.status(500).json({ message: "Unexpected error" });
};
