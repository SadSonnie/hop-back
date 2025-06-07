const { requiredField } = require("../errorMessages");
const { logger } = require("../logger");
const {
  setPlaceUserPhotosTitleService,
  removePlaceUserPhotosTitleService,
  getPlaceUserPhotosTitleService
} = require("../services/placeUserPhotosTitleService");

class PlaceUserPhotosTitleController {
  // Установка или обновление заголовка
  async setTitle(req, res, next) {
    try {
      const { place_id, title } = req.body;
      logger.info(`Setting user photos title for place ${place_id}`);
      
      if (!place_id) requiredField("place_id");
      if (!title) requiredField("title");

      const response = await setPlaceUserPhotosTitleService(place_id, title);
      return res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  // Удаление заголовка
  async removeTitle(req, res, next) {
    try {
      const { place_id } = req.body;
      logger.info(`Removing user photos title for place ${place_id}`);
      
      if (!place_id) requiredField("place_id");

      await removePlaceUserPhotosTitleService(place_id);
      return res.status(200).json({});
    } catch (err) {
      next(err);
    }
  }

  // Получение заголовка
  async getTitle(req, res, next) {
    try {
      const { place_id } = req.params;
      logger.info(`Getting user photos title for place ${place_id}`);
      
      if (!place_id) requiredField("place_id");

      const response = await getPlaceUserPhotosTitleService(place_id);
      return res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new PlaceUserPhotosTitleController(); 