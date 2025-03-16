const ApiError = require("../exceptions/apiError.js");
const { sessionDataMetric } = require("../services/dataMetricService.js");
const { logger } = require("../logger");

module.exports = async (req, res, next) => {
  try {
    const { userId } = req;

    if (userId) {
      // Handle session tracking asynchronously
      sessionDataMetric({ userId }).catch(err => {
        logger.error("Failed to track session:", err);
      });
    }

    next();
  } catch (err) {
    logger.error("Error in session middleware:", err);
    next(); // Continue even if session tracking fails
  }
};
