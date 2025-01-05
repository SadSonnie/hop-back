const {
  createCategoriesService,
  updateCategoriesService,
  getCategoriesService,
  removeCategoriesService,
} = require("../services/categoriesService");

const { requiredField } = require("../errorMessages");
const { requestLog } = require("../logger");

class CategoriesController {
  async create(req, res, next) {
    try {
      requestLog(req);
      const { name } = req.body;
      if (!name) requiredField("name");

      const response = await createCategoriesService({ name });
      return res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      requestLog(req);
      const { name, id } = req.body;

      if (!id) requiredField("id");

      const response = await updateCategoriesService({ id, name });
      return res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async getItems(req, res, next) {
    try {
      requestLog(req);
      const { id } = req.params;
      const { limit, offset } = req.query;
      const response = await getCategoriesService({ id, limit, offset });

      return res.status(200).json(!id ? { items: response } : { ...response });
    } catch (err) {
      next(err);
    }
  }

  async remove(req, res, next) {
    try {
      requestLog(req);
      const { id } = req.body;
      if (!id) requiredField("id");
      await removeCategoriesService(id);
      return res.status(200).json({});
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CategoriesController();
