const ApiError = require("../exceptions/apiError.js");
const { ChecklistItem, UserChecklistStatus, User } = require("../models");
const { notFoundError } = require("../errorMessages.js");
const { logger } = require("../logger");

// Функция для получения пунктов чек-листа
const getChecklistItems = async ({ offset = 0, limit = 50, includeInactive = false }) => {
  try {
    const whereCondition = includeInactive ? {} : { active: true };
    
    const items = await ChecklistItem.findAll({
      where: whereCondition,
      limit: Number(limit),
      offset: Number(offset),
      order: [["order", "ASC"], ["id", "ASC"]],
    });

    return items;
  } catch (error) {
    logger.error('Error getting checklist items:', error);
    throw error;
  }
};

// Функция для получения пунктов чек-листа с их статусом для конкретного пользователя
const getUserChecklist = async ({ userId, offset = 0, limit = 50 }) => {
  try {
    // Находим пользователя по tg_id
    const user = await User.findOne({
      where: { tg_id: userId }
    });

    if (!user) {
      throw ApiError.NotFound("Пользователь не найден");
    }

    // Получаем все активные пункты чек-листа
    const items = await ChecklistItem.findAll({
      where: { active: true },
      limit: Number(limit),
      offset: Number(offset),
      order: [["order", "ASC"], ["id", "ASC"]],
    });

    // Получаем статусы для всех пунктов для этого пользователя
    const statuses = await UserChecklistStatus.findAll({
      where: { user_id: user.id },
      attributes: ['checklist_item_id', 'completed', 'completed_at'],
    });

    // Создаем карту статусов для быстрого доступа
    const statusMap = statuses.reduce((map, status) => {
      map[status.checklist_item_id] = {
        completed: status.completed,
        completed_at: status.completed_at
      };
      return map;
    }, {});

    // Комбинируем пункты и статусы
    const result = items.map(item => {
      const status = statusMap[item.id] || { completed: false, completed_at: null };
      return {
        id: item.id,
        title: item.title,
        order: item.order,
        completed: status.completed,
        completed_at: status.completed_at
      };
    });

    return result;
  } catch (error) {
    logger.error('Error getting user checklist:', error);
    throw error;
  }
};

// Функция для создания нового пункта чек-листа (только для админов)
const createChecklistItem = async ({ title, order }) => {
  try {
    // Находим максимальный порядковый номер, если order не указан
    if (order === undefined) {
      const maxOrder = await ChecklistItem.max('order') || 0;
      order = maxOrder + 1;
    }

    const newItem = await ChecklistItem.create({
      title,
      order,
      active: true
    });

    return newItem;
  } catch (error) {
    logger.error('Error creating checklist item:', error);
    throw error;
  }
};

// Функция для обновления пункта чек-листа (только для админов)
const updateChecklistItem = async ({ id, title, order, active }) => {
  try {
    const item = await ChecklistItem.findByPk(id);
    
    if (!item) {
      throw ApiError.NotFound(notFoundError("ChecklistItem"));
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (order !== undefined) updateData.order = order;
    if (active !== undefined) updateData.active = active;

    await item.update(updateData);

    return item;
  } catch (error) {
    logger.error('Error updating checklist item:', error);
    throw error;
  }
};

// Функция для удаления пункта чек-листа (только для админов)
const deleteChecklistItem = async ({ id }) => {
  try {
    const item = await ChecklistItem.findByPk(id);
    
    if (!item) {
      throw ApiError.NotFound(notFoundError("ChecklistItem"));
    }

    // Удаляем статусы для этого пункта
    await UserChecklistStatus.destroy({
      where: { checklist_item_id: id }
    });

    // Удаляем сам пункт
    await item.destroy();

    return { success: true };
  } catch (error) {
    logger.error('Error deleting checklist item:', error);
    throw error;
  }
};

// Функция для обновления статуса выполнения пункта чек-листа
const toggleChecklistItemStatus = async ({ userId, itemId }) => {
  try {
    // Находим пользователя по tg_id
    const user = await User.findOne({
      where: { tg_id: userId }
    });

    if (!user) {
      throw ApiError.NotFound("Пользователь не найден");
    }

    // Проверяем существование пункта чек-листа
    const item = await ChecklistItem.findByPk(itemId);
    
    if (!item) {
      throw ApiError.NotFound(notFoundError("ChecklistItem"));
    }

    if (!item.active) {
      throw ApiError.BadRequest("Этот пункт чек-листа неактивен");
    }

    // Находим или создаем запись о статусе
    const [status, created] = await UserChecklistStatus.findOrCreate({
      where: {
        user_id: user.id,
        checklist_item_id: itemId
      },
      defaults: {
        completed: true,
        completed_at: new Date()
      }
    });

    // Если запись уже существовала, инвертируем статус
    if (!created) {
      const newCompletedStatus = !status.completed;
      await status.update({
        completed: newCompletedStatus,
        completed_at: newCompletedStatus ? new Date() : null
      });
    }

    return {
      itemId,
      completed: created ? true : status.completed,
      completed_at: created ? new Date() : status.completed_at
    };
  } catch (error) {
    logger.error('Error toggling checklist item status:', error);
    throw error;
  }
};

module.exports = {
  getChecklistItems,
  getUserChecklist,
  createChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
  toggleChecklistItemStatus
}; 