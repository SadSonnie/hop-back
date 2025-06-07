const { Tags, ContextualTags, sequelize } = require("../models");
const ApiError = require("../exceptions/apiError");
const { notFoundError } = require("../errorMessages");

// Создание контекстного тега
const createContextualTagService = async ({ name, parent_tag_id }) => {
  const transaction = await sequelize.transaction();
  try {
    // Проверяем существование родительского тега
    const parentTag = await Tags.findByPk(parent_tag_id);
    if (!parentTag) {
      throw ApiError.BadRequest(`Tag with id ${parent_tag_id} not found`);
    }

    const contextualTag = await ContextualTags.create(
      { name, parent_tag_id },
      { transaction }
    );

    await transaction.commit();
    return contextualTag;
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

// Получение контекстных тегов для конкретного тега
const getContextualTagsForParentService = async (parent_tag_id) => {
  try {
    const contextualTags = await ContextualTags.findAll({
      where: { parent_tag_id },
      order: [["createdAt", "DESC"]],
    });
    return contextualTags;
  } catch (err) {
    throw ApiError.BadRequest("Error getting contextual tags");
  }
};

// Обновление контекстного тега
const updateContextualTagService = async ({ id, name }) => {
  try {
    const contextualTag = await ContextualTags.findByPk(id);
    if (!contextualTag) {
      notFoundError("Contextual tag", id);
    }

    const updatedTag = await contextualTag.update({ name });
    return updatedTag;
  } catch (err) {
    throw err;
  }
};

// Удаление контекстного тега
const removeContextualTagService = async (id) => {
  try {
    const contextualTag = await ContextualTags.findByPk(id);
    if (!contextualTag) {
      notFoundError("Contextual tag", id);
    }

    await contextualTag.destroy();
  } catch (err) {
    throw err;
  }
};

// Получение всех тегов с их контекстными тегами
const getAllTagsWithContextualService = async () => {
  try {
    const tags = await Tags.findAll({
      include: [{
        model: ContextualTags,
        as: 'contextualTags'
      }],
      order: [["createdAt", "DESC"]],
    });
    return tags;
  } catch (err) {
    throw ApiError.BadRequest("Error getting tags with contextual tags");
  }
};

module.exports = {
  createContextualTagService,
  getContextualTagsForParentService,
  updateContextualTagService,
  removeContextualTagService,
  getAllTagsWithContextualService
}; 