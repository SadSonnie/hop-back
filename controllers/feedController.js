const { requestLog } = require("../logger");
const { getItemsFeedService } = require("../services/feedService");

class FeedController {
  async getItems(req, res, next) {
    requestLog(req);
    try {
      const { limit = 20, offset = 0 } = req.query;
      const response = await getItemsFeedService({ limit, offset });

      return res.status(200).json({ ...response });
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new FeedController();
