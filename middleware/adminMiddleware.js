const ApiError = require("../exceptions/apiError.js");
const { User } = require("../models");

module.exports = async (req, res, next) => {
  try {
    if (!req.userId) {
      throw ApiError.ErrorAccess("Authentication required");
    }

    const user = await User.findOne({ where: { tg_id: req.userId } });
    
    if (!user) {
      throw ApiError.NotFound("User not found");
    }

    if (user.role !== "ADMIN") {
      throw ApiError.ErrorAccess("Admin access required");
    }

    // Добавляем пользователя в req для использования в контроллерах
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};
