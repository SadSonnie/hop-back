const { requestLog } = require("../logger");
const { getSearchService } = require("../services/searchService");

class SearchController {
  async getItems(req, res, next) {
    try {
      requestLog(req);
      const response = await getSearchService(req.query);

      return res.status(200).json({ ...response });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new SearchController();
