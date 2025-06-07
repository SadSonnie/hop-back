const { Places, ContextualTags, PlaceContextualTags, sequelize } = require("../models");
const ApiError = require("../exceptions/apiError");
const { notFoundError } = require("../errorMessages");

// Добавление контекстного тега к месту
const addContextualTagToPlaceService = async ({ place_id, contextual_tag_id }) => {
  const transaction = await sequelize.transaction();
  try {
    // Проверяем существование места
    const place = await Places.findByPk(place_id);
    if (!place) {
      throw ApiError.BadRequest(`Place with id ${place_id} not found`);
    }

    // Проверяем существование контекстного тега
    const contextualTag = await ContextualTags.findByPk(contextual_tag_id);
    if (!contextualTag) {
      throw ApiError.BadRequest(`Contextual tag with id ${contextual_tag_id} not found`);
    }

    // Создаем связь
    const placeContextualTag = await PlaceContextualTags.create(
      { place_id, contextual_tag_id },
      { transaction }
    );

    await transaction.commit();
    return placeContextualTag;
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

// Удаление контекстного тега у места
const removeContextualTagFromPlaceService = async ({ place_id, contextual_tag_id }) => {
  const transaction = await sequelize.transaction();
  try {
    const deleted = await PlaceContextualTags.destroy({
      where: {
        place_id,
        contextual_tag_id
      },
      transaction
    });

    if (!deleted) {
      throw ApiError.NotFound("Place-contextual tag relationship not found");
    }

    await transaction.commit();
    return true;
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

// Получение всех контекстных тегов места
const getPlaceContextualTagsService = async (place_id) => {
  try {
    const place = await Places.findByPk(place_id);
    if (!place) {
      throw ApiError.BadRequest(`Place with id ${place_id} not found`);
    }

    const contextualTags = await PlaceContextualTags.findAll({
      where: { place_id },
      include: [{
        model: ContextualTags,
        attributes: ['id', 'name', 'parent_tag_id']
      }],
      order: [[ContextualTags, 'createdAt', 'DESC']]
    });

    return contextualTags.map(tag => tag.ContextualTag);
  } catch (err) {
    throw err;
  }
};

module.exports = {
  addContextualTagToPlaceService,
  removeContextualTagFromPlaceService,
  getPlaceContextualTagsService
}; 