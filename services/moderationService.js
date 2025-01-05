const ApiError = require("../exceptions/apiError");
const { Moderation } = require("../models");

const getModerations = async ({ limit, offset, user_id, id }) => {
  try {
    if (id) {
      const moderation = await Moderation.findByPk(id);
      if (!moderation) throw new Error("moderation");

      return {
        id: moderation.id,
        user_id: moderation.id,
        action: moderation.action,
        target_type: moderation.target_type,
        target_id: moderation.target_id,
      };
    } else {
      const filter = {};
      if (user_id) {
        filter.user_id = user_id;
      }
      const moderations = await Moderation.findAll({
        where: filter,
        limit,
        offset,
        order: [["createdAt", "DESC"]],
      });

      return moderations.map((moderation) => ({
        id: moderation.id,
        user_id: moderation.user_id,
        action: moderation.action,
        target_type: moderation.target_type,
        target_id: moderation.target_id,
      }));
    }
  } catch (err) {
    const msg = err.message;
    if (msg == "moderation") throw ApiError.NotFound("Moderation not found");
    else if (msg == "user") throw ApiError.NotFound("User not found");
    else throw ApiError.BadRequest("Something wrong");
  }
};

module.exports = {
  getModerations,
};
