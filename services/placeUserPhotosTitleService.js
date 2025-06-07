const { Places, PlaceUserPhotosTitle, sequelize } = require("../models");
const ApiError = require("../exceptions/apiError");

// Добавление или обновление заголовка
const setPlaceUserPhotosTitleService = async (place_id, title) => {
  const transaction = await sequelize.transaction();
  try {
    // Проверяем существование места
    const place = await Places.findByPk(place_id);
    if (!place) {
      throw ApiError.BadRequest(`Place with id ${place_id} not found`);
    }

    // Ищем существующий заголовок
    const existingTitle = await PlaceUserPhotosTitle.findOne({
      where: { place_id }
    });

    let result;
    if (existingTitle) {
      // Обновляем существующий заголовок
      result = await existingTitle.update({ title }, { transaction });
    } else {
      // Создаем новый заголовок
      result = await PlaceUserPhotosTitle.create(
        { place_id, title },
        { transaction }
      );
    }

    await transaction.commit();
    return result;
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

// Удаление заголовка
const removePlaceUserPhotosTitleService = async (place_id) => {
  const transaction = await sequelize.transaction();
  try {
    const deleted = await PlaceUserPhotosTitle.destroy({
      where: { place_id },
      transaction
    });

    if (!deleted) {
      throw ApiError.NotFound("Place user photos title not found");
    }

    await transaction.commit();
    return true;
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

// Получение заголовка для места
const getPlaceUserPhotosTitleService = async (place_id) => {
  try {
    const title = await PlaceUserPhotosTitle.findOne({
      where: { place_id }
    });
    return title;
  } catch (err) {
    throw err;
  }
};

module.exports = {
  setPlaceUserPhotosTitleService,
  removePlaceUserPhotosTitleService,
  getPlaceUserPhotosTitleService
}; 