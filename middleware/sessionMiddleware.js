const ApiError = require("../exceptions/apiError.js");
const { sessionDataMetric } = require("../services/dataMetricService.js");


const handleSession = async (userId) => {
  await sessionDataMetric({userId})
}


module.exports = async (req, res, next) => {
  try {
    const {userId, type} = req

    handleSession(userId)

    next();
  } catch (err) {
    console.log(err);
    throw ApiError.ErrorAccess("Access denied");
  }
};
