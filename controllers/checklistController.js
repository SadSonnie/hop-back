const ApiError = require("../exceptions/apiError");
const { requestLog } = require("../logger");
const {
  getChecklistItems,
  getUserChecklist,
  createChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
  toggleChecklistItemStatus
} = require("../services/checklistService");

class ChecklistController {
  // Получение всех пунктов чек-листа (для админов)
  async getAllChecklistItems(req, res, next) {
    try {
      requestLog(req);
      const { limit, offset, include_inactive } = req.query;
      
      const items = await getChecklistItems({
        limit,
        offset,
        includeInactive: include_inactive === 'true'
      });

      return res.status(200).json({ items });
    } catch (e) {
      next(e);
    }
  }

  // Получение чек-листа с информацией о выполнении для конкретного пользователя
  async getUserChecklist(req, res, next) {
    try {
      requestLog(req);
      const { userId } = req;
      const { limit, offset } = req.query;
      
      if (!userId) {
        throw ApiError.UnauthorizedError();
      }

      const items = await getUserChecklist({
        userId,
        limit,
        offset
      });

      return res.status(200).json({ items });
    } catch (e) {
      next(e);
    }
  }

  // Создание нового пункта чек-листа (только для админов)
  async createChecklistItem(req, res, next) {
    try {
      requestLog(req);
      const { title, order } = req.body;
      
      if (!title) {
        throw ApiError.BadRequest("Заголовок обязателен");
      }

      const item = await createChecklistItem({
        title,
        order
      });

      return res.status(201).json(item);
    } catch (e) {
      next(e);
    }
  }

  // Обновление пункта чек-листа (только для админов)
  async updateChecklistItem(req, res, next) {
    try {
      requestLog(req);
      const { id } = req.params;
      const { title, order, active } = req.body;
      
      if (!id) {
        throw ApiError.BadRequest("ID элемента обязателен");
      }

      const item = await updateChecklistItem({
        id,
        title,
        order,
        active
      });

      return res.status(200).json(item);
    } catch (e) {
      next(e);
    }
  }

  // Удаление пункта чек-листа (только для админов)
  async deleteChecklistItem(req, res, next) {
    try {
      requestLog(req);
      const { id } = req.params;
      
      if (!id) {
        throw ApiError.BadRequest("ID элемента обязателен");
      }

      const result = await deleteChecklistItem({ id });

      return res.status(200).json(result);
    } catch (e) {
      next(e);
    }
  }

  // Изменение статуса выполнения пункта чек-листа (для любых пользователей)
  async toggleChecklistItemStatus(req, res, next) {
    try {
      requestLog(req);
      const { userId } = req;
      const { item_id } = req.body;
      
      if (!userId) {
        throw ApiError.UnauthorizedError();
      }

      if (!item_id) {
        throw ApiError.BadRequest("ID элемента обязателен");
      }

      const result = await toggleChecklistItemStatus({
        userId,
        itemId: item_id
      });

      return res.status(200).json(result);
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new ChecklistController(); 