const { requestLog } = require("../logger");
const { getModerations } = require("../services/moderationService");

class ModerationController {
  async getItems(req, res, next) {
    try {
      requestLog(req);
      const { id } = req.params;
      const { limit, offset, user_id } = req.query;

      const response = await getModerations({ limit, offset, user_id, id });

      return res.status(200).json(!id ? { items: response } : { ...response });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ModerationController();
