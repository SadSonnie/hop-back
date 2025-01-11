const { requiredField } = require("../errorMessages");
const { requestLog } = require("../logger");

const {
  createPlaceService,
  updatePlaceService,
  getItemPlaceService,
  getItemsPlaceService,
  removePlaceService,
  addPicturePlace,
} = require("../services/placesService");

class PlacesController {
  async getItems(req, res, next) {
    try {
      requestLog(req);
      const { id } = req.params;
      const { offset, limit } = req.query;

      let response;

      if (id) {
        response = await getItemPlaceService({ id });
      } else {
        response = await getItemsPlaceService({ offset, limit });
      }

      return res.status(200).json(!id ? { items: response } : { ...response });
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      requestLog(req);
      const { 
        name, 
        address, 
        collection_ids, 
        tags_ids, 
        category_id,
        description,
        isPremium,
        priceLevel,
        coordinates,
        phone
      } = req.body;

      if (!name) requiredField("name");
      if (!address) requiredField("address");
      if (!category_id) requiredField("category_id");

      const response = await createPlaceService({
        name,
        collectionIds: collection_ids,
        tagsIds: tags_ids,
        address,
        categoryId: category_id,
        description,
        isPremium,
        priceLevel,
        coordinates,
        phone
      });

      return res.status(200).json({ ...response });
    } catch (e) {
      next(e);
    }
  }

  async remove(req, res, next) {
    try {
      requestLog(req);
      const { id } = req.body;
      if (!id) requiredField("id");

      await removePlaceService(id);

      return res.status(200).json({});
    } catch (e) {
      next(e);
    }
  }

  async upload(req, res, next) {
    try {
      const { id } = req.body;
      const { file } = req;

      if (!id) requiredField("id");

      const response = await addPicturePlace({ id, name: file.path });
      return res.status(200).json({ ...response });
    } catch (e) {
      console.log(e);
      next(e);
    }
  }

  async update(req, res, next) {
    try {
      requestLog(req);
      const { id } = req.body;
      if (!id) requiredField("id");

      const response = await updatePlaceService(req.body);

      return res.status(200).json({ ...response });
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new PlacesController();
