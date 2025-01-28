const ApiError = require("../exceptions/apiError");
const { requestLog } = require("../logger");
const {
  authService,
  getUserService,
  updateUserService,
  removeUserService,
  toggleRoleService,
} = require("../services/userServices");

class UserController {
  async authUser(req, res, next) {
    try {
      requestLog(req);
      const { userId } = req;

      if (!userId) throw ApiError.UnauthorizedError();

      const response = await authService(userId);

      return res.status(200).json({ ...response });
    } catch (e) {
      next(e);
    }
  }

  async getUser(req, res, next) {
    try {
      requestLog(req);
      const userId = req.params.id;
      const { limit, offset } = req.query;

      const response = await getUserService({ limit, offset, userId });

      return res
        .status(200)
        .json(!userId ? { items: response } : { ...response });
    } catch (e) {
      next(e);
    }
  }

  async updateUser(req, res, next) {
    try {
      requestLog(req);
      const { id: userId } = req.body;
      const response = await updateUserService({ userId, data: req.body });

      return res.status(200).json({ ...response });
    } catch (e) {
      next(e);
    }
  }

  async removeUser(req, res, next) {
    try {
      requestLog(req);
      const { userId } = req;
      const response = await removeUserService({ userId });

      return res.status(200).json({ ...response });
    } catch (e) {
      next(e);
    }
  }

  async toggleRole(req, res, next) {
    try {
      requestLog(req);
      const { user_id: userId } = req.body;
      
      const response = await toggleRoleService({ userId });

      return res.status(200).json({ ...response });
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new UserController();
