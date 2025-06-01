const ApiError = require("../exceptions/apiError.js");
const { User } = require("../models");

module.exports = async (req, res, next) => {
  try {
    console.log('=== DEBUG adminMiddleware START ===');
    console.log('userId from request:', req.userId);
    console.log('Headers:', req.headers);
    console.log('Method:', req.method);
    console.log('Path:', req.path);

    if (!req.userId) {
      console.log('Error: No userId provided');
      throw ApiError.ErrorAccess("Authentication required");
    }

    const user = await User.findOne({ where: { tg_id: req.userId } });
    console.log('Found user:', user ? { id: user.id, tg_id: user.tg_id, role: user.role } : null);
    
    if (!user) {
      console.log('Error: User not found');
      throw ApiError.NotFound("User not found");
    }

    if (user.role !== "ADMIN") {
      console.log('Error: User is not admin');
      throw ApiError.ErrorAccess("Admin access required");
    }

    // Добавляем пользователя в req для использования в контроллерах
    req.user = user;
    console.log('=== DEBUG adminMiddleware END ===');
    next();
  } catch (err) {
    console.log('=== DEBUG adminMiddleware ERROR ===');
    console.log('Error:', err);
    next(err);
  }
};
