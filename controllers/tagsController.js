const { requiredField } = require("../errorMessages");
const { requestLog } = require("../logger");
const {
  createTagsService,
  updateTagsService,
  getTagsService,
  removeTagsService,
} = require("../services/tagService");

class TagsController {
  async create(req, res, next) {
    try {
      requestLog(req);
      const { name, places_ids } = req.body;
      if (!name) requiredField("name");
      const response = await createTagsService({ name, places_ids });

      return res.status(200).json({ ...response });
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      requestLog(req);
      const response = await updateTagsService(req.body);

      return res.status(200).json({ ...response });
    } catch (err) {
      next(err);
    }
  }

  async getItems(req, res, next) {
    try {
      requestLog(req);
      const { id } = req.params;
      const { offset, limit } = req.query;

      const response = await getTagsService({ id, offset, limit });

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
      await removeTagsService(id);

      return res.status(200).json({});
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new TagsController();
