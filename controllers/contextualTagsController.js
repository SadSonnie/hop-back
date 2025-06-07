const { requiredField } = require("../errorMessages");
const { requestLog } = require("../logger");
const {
  createContextualTagService,
  getContextualTagsForParentService,
  updateContextualTagService,
  removeContextualTagService,
  getAllTagsWithContextualService,
} = require("../services/contextualTagService");

class ContextualTagsController {
  // Создание нового контекстного тега
  async create(req, res, next) {
    try {
      requestLog(req);
      const { name, parent_tag_id } = req.body;
      
      if (!name) requiredField("name");
      if (!parent_tag_id) requiredField("parent_tag_id");

      const response = await createContextualTagService({ name, parent_tag_id });
      return res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  // Получение контекстных тегов для конкретного родительского тега
  async getByParentId(req, res, next) {
    try {
      requestLog(req);
      const { parent_tag_id } = req.params;
      
      if (!parent_tag_id) requiredField("parent_tag_id");

      const response = await getContextualTagsForParentService(parent_tag_id);
      return res.status(200).json({ items: response });
    } catch (err) {
      next(err);
    }
  }

  // Обновление контекстного тега
  async update(req, res, next) {
    try {
      requestLog(req);
      const { id, name } = req.body;
      
      if (!id) requiredField("id");
      if (!name) requiredField("name");

      const response = await updateContextualTagService({ id, name });
      return res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  // Удаление контекстного тега
  async remove(req, res, next) {
    try {
      requestLog(req);
      const { id } = req.body;
      
      if (!id) requiredField("id");

      await removeContextualTagService(id);
      return res.status(200).json({});
    } catch (err) {
      next(err);
    }
  }

  // Получение всех тегов с их контекстными тегами
  async getAllWithContextual(req, res, next) {
    try {
      requestLog(req);
      const response = await getAllTagsWithContextualService();
      return res.status(200).json({ items: response });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ContextualTagsController(); 