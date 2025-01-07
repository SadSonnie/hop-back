const { requestLog } = require("../logger");
const { getItemsFeedService, createItemsFeedService, updateItemFeedService } = require("../services/feedService");

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

  async createItems(req, res, next) {
    requestLog(req);
    try {
      const items = req.body.items;
      
      if (!Array.isArray(items)) {
        return res.status(400).json({ error: "Items should be an array" });
      }

      const response = await createItemsFeedService({ items });
      return res.status(201).json({ ...response });
    } catch (e) {
      next(e);
    }
  }

  async updateItem(req, res, next) {
    requestLog(req);
    try {
      const { items } = req.body;
      
      if (!Array.isArray(items)) {
        return res.status(400).json({ error: "Items should be an array" });
      }

      // Validate each item
      for (const item of items) {
        if (!item.id) {
          return res.status(400).json({ error: "Each item must have an ID" });
        }
        if (!item.type) {
          return res.status(400).json({ error: "Each item must have a type" });
        }
        if (!item.data) {
          return res.status(400).json({ error: "Each item must have data" });
        }
      }

      const response = await updateItemFeedService({ items });
      return res.status(200).json({ ...response });
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new FeedController();
