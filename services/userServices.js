const ApiError = require("../exceptions/apiError.js");
const { User, TelegramUsernames } = require("../models");
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

const authService = async (userId, username) => {
  try {
    const user = await findUser(userId);

    if (!user) {
      const newUser = await User.create({
        tg_id: userId,
        role: "USER",
      });
      
      // Создаем запись для нового пользователя
      await TelegramUsernames.create({
        user_id: newUser.id,
        username: username || null,
        last_updated: new Date()
      });
      
      return returnedData(newUser);
    }

    // Обновляем или создаем запись для существующего пользователя
    const [record] = await TelegramUsernames.findOrCreate({
      where: { user_id: user.id },
      defaults: {
        username: username || null,
        last_updated: new Date()
      }
    });

    if (record) {
      await record.update({
        username: username || null,
        last_updated: new Date()
      });
    }

    return returnedData(user);
  } catch (err) {
    throw ApiError.UnauthorizedError();
  }
};

const saveUsername = async (userId, username) => {
  try {
    if (!username) return;
    
    const user = await User.findOne({
      where: { tg_id: userId }
    });
    
    if (user) {
      const [record] = await TelegramUsernames.findOrCreate({
        where: { user_id: user.id },
        defaults: {
          username: username,
          last_updated: new Date()
        }
      });

      if (record) {
        await record.update({
          username: username,
          last_updated: new Date()
        });
      }
    }
  } catch (err) {
    console.error('Error saving username:', err);
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

const getUsernameByTgId = async (tgId) => {
  try {
    const user = await User.findOne({
      where: { tg_id: tgId }
    });

    if (!user) {
      return null;
    }

    const usernameData = await TelegramUsernames.findOne({
      where: { user_id: user.id },
      attributes: ['username', 'last_updated']
    });

    if (!usernameData) {
      return null;
    }

    return {
      username: usernameData.username,
      last_updated: usernameData.last_updated
    };
  } catch (err) {
    console.error('Error getting username:', err);
    return null;
  }
};

module.exports = {
  authService,
  getUserService,
  updateUserService,
  removeUserService,
  toggleRoleService,
  findUser,
  saveUsername,
  getUsernameByTgId
};
