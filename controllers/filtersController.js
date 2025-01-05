const {
  createFilterService,
  removeFilterService,
  updateFilterService,
  getFiltersService,
} = require("../services/filterService");
const { requiredField } = require("../errorMessages");
const { requestLog } = require("../logger");

class FiltersController {
  async create(req, res, next) {
    try {
      requestLog(req);
      const { name } = req.body;
      if (!name) requiredField("name");
      const response = await createFilterService(name);
      res.status(201).json({ ...response });
    } catch (error) {
      next(error);
    }
  }
  async update(req, res, next) {
    try {
      requestLog(req);
      const { id } = req.body;
      if (!id) requiredField("id");
      const response = await updateFilterService(req.body);
      res.status(200).json({ ...response });
    } catch (error) {
      next(error);
    }
  }

  async remove(req, res, next) {
    try {
      requestLog(req);
      const { id } = req.body;
      if (!id) requiredField("id");

      await removeFilterService(id);
      res.status(200).json({});
    } catch (error) {
      next(error);
    }
  }
  async getItems(req, res, next) {
    try {
      requestLog(req);
      const { id } = req.params;
      const { limit, offset } = req.query;
      const response = await getFiltersService({
        id,
        limit,
        offset,
      });
      res.status(200).json(!id ? { items: response } : { ...response });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FiltersController();
