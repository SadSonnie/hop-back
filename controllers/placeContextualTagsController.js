const { requiredField } = require("../errorMessages");
const { logger } = require("../logger");
const {
  addContextualTagToPlaceService,
  removeContextualTagFromPlaceService,
  getPlaceContextualTagsService
} = require("../services/placeContextualTagService");

class PlaceContextualTagsController {
  // Добавление контекстного тега к месту
  async addToPlace(req, res, next) {
    try {
      const { place_id, contextual_tag_id } = req.body;
      logger.info(`Adding contextual tag ${contextual_tag_id} to place ${place_id}`);
      
      if (!place_id) requiredField("place_id");
      if (!contextual_tag_id) requiredField("contextual_tag_id");

      const response = await addContextualTagToPlaceService({ place_id, contextual_tag_id });
      return res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  // Удаление контекстного тега у места
  async removeFromPlace(req, res, next) {
    try {
      const { place_id, contextual_tag_id } = req.body;
      logger.info(`Removing contextual tag ${contextual_tag_id} from place ${place_id}`);
      
      if (!place_id) requiredField("place_id");
      if (!contextual_tag_id) requiredField("contextual_tag_id");

      await removeContextualTagFromPlaceService({ place_id, contextual_tag_id });
      return res.status(200).json({});
    } catch (err) {
      next(err);
    }
  }

  // Получение контекстных тегов места
  async getByPlaceId(req, res, next) {
    try {
      const { place_id } = req.params;
      logger.info(`Getting contextual tags for place ${place_id}`);
      
      if (!place_id) requiredField("place_id");

      const response = await getPlaceContextualTagsService(place_id);
      return res.status(200).json({ items: response });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new PlaceContextualTagsController(); 