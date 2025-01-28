const ApiError = require("../exceptions/apiError.js");
const { User } = require("../models");
const { notFoundError } = require("../errorMessages.js");

const returnedData = (user) => ({
  id: user.id,
  tg_id: user.tg_id,
  role: user.role,
});

const findUser = async (userId) => {
  const user = await User.findOne({
    where: {
      tg_id: userId,
    },
  });
  return user;
};

const authService = async (userId) => {
  try {
    const user = await findUser(userId);

    if (!user) {
      const newUser = await User.create({
        tg_id: userId,
        role: "USER",
      });
      return returnedData(newUser);
    }

    return returnedData(user);
  } catch (err) {
    throw ApiError.UnauthorizedError();
  }
};

const getUserService = async ({ offset = 0, limit = 20, userId }) => {
  try {
    if (userId) {
      const user = await User.findByPk(userId);
      if (!user) throw new Error();
      return returnedData(user);
    }
    const users = await User.findAll({
      limit: limit,
      offset: offset,
      order: [["createdAt", "DESC"]],
    });

    return users.map((user) => returnedData(user));
  } catch (err) {
    notFoundError("User", userId);
  }
};

const updateUserService = async ({ data, userId }) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) throw new Error();

    await user.update(data);

    return returnedData(user);
  } catch (err) {
    notFoundError("User", userId);
  }
};

const removeUserService = async ({ userId }) => {
  try {
    await User.destroy({
      where: { tg_id: userId },
    });

    return {};
  } catch (err) {
    notFoundError("User", userId);
  }
};

const toggleRoleService = async ({ userId }) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      throw ApiError.BadRequest(notFoundError("User"));
    }

    const newRole = user.role === "ADMIN" ? "USER" : "ADMIN";
    await user.update({ role: newRole });

    return returnedData(user);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  authService,
  getUserService,
  updateUserService,
  removeUserService,
  toggleRoleService,
  findUser,
};
