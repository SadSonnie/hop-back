const ApiError = require("../exceptions/apiError.js");
const { User } = require("../models");
const { notFound } = require("../errorMessages.js");

module.exports = async (req, res, next) => {
  try {
    const { userId } = req;

    const user = await User.findOne({ where: { tg_id: userId } });

    if (!user) throw new Error("access");

    if (user.role !== "ADMIN") throw new Error("access");

    next();
  } catch (err) {
    const msg = err.message;

    if (msg === "user") {
      return next(ApiError.NotFound(notFound("User", req.userId)));
    } else if (msg === "access") {
      return next(ApiError.ErrorAccess("Access denied"));
    }

    next(err);
  }
};
