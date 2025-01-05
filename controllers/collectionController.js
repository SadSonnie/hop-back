const { requiredField } = require("../errorMessages");
const { requestLog } = require("../logger");

const {
  createCollectionService,
  getItemCollectionService,
  getItemsCollectionService,
  updateCollectionService,
  removeCollectionService,
} = require("../services/collectionService");

class CollectionController {
  async create(req, res, next) {
    try {
      requestLog(req);
      const { userId } = req;
      const { name, places_ids: placesIds } = req.body;
      if (!name) requiredField("name");

      const response = await createCollectionService({
        userId,
        name,
        placesIds,
      });

      return res.status(200).json({ ...response });
    } catch (err) {
      next(err);
    }
  }
  async update(req, res, next) {
    try {
      requestLog(req);
      const { id } = req.body;
      if (!id) requiredField("id");

      const response = await updateCollectionService({ ...req.body });

      return res.status(200).json({ ...response });
    } catch (err) {
      next(err);
    }
  }
  async remove(req, res, next) {
    try {
      requestLog(req);
      const { id } = req.body;
      if (!id) requiredField("id");

      await removeCollectionService(id);

      return res.status(200).json({});
    } catch (err) {
      next(err);
    }
  }
  async getItems(req, res, next) {
    try {
      requestLog(req);
      const { limit, offset } = req.query;
      const { id } = req.params;

      let response;
      if (id) {
        response = await getItemCollectionService({ id });
      } else {
        response = await getItemsCollectionService({ limit, offset });
      }

      return res.status(200).json(!id ? { items: response } : { ...response });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CollectionController();
