const ApiError = require("../exceptions/apiError.js");
const { processQueryString } = require("../utils.js");

module.exports = (req, res, next) => {
  try {
    const token = (req.headers.authorization || "").replace(/Bearer\s?/, "");

    if (!token) throw ApiError.ErrorAccess("Access denied");

    const userId = processQueryString(token);

    req.userId = userId;

    next();
  } catch (err) {
    throw ApiError.ErrorAccess("Access denied");
  }
};
