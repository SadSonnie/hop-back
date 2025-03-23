const ApiError = require("../exceptions/apiError.js");
const { sessionDataMetric, trackHourlyActivity } = require("../services/dataMetricService.js");
const { logger } = require("../logger");

module.exports = async (req, res, next) => {
  try {
    const { userId } = req;

    // Track hourly activity first
    const now = new Date();
    const hour = (now.getUTCHours() + 3) % 24; // Convert to MSK time (UTC+3)
    trackHourlyActivity(hour).catch(err => {
      logger.error("Failed to track hourly activity:", err);
    });

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