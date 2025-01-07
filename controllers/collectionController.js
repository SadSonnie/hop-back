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
  /**
   * Creates a new collection
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async create(req, res, next) {
    try {
      requestLog(req);
      const { userId } = req;
      const { name, description, places_ids: placesIds } = req.body;
      if (!name) requiredField("name");

      const response = await createCollectionService({
        userId,
        name,
        description,
        placesIds,
      });

      return res.status(200).json({ ...response });
    } catch (err) {
      next(err);
    }
  }
  /**
   * Updates an existing collection
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
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
  /**
   * Removes a collection
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
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
  /**
   * Retrieves a collection or a list of collections
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
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
