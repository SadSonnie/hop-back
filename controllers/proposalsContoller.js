const {
  createProposalsService,
  getProposalsService,
  updateProposalsService,
  removeProposalsService,
} = require("../services/proposalsService");

const { requiredField } = require("../errorMessages");
const { requestLog } = require("../logger");

class ProposalsController {
  async create(req, res, next) {
    try {
      requestLog(req);
      const { userId } = req;
      const {
        category_id: categoryId,
        place_name: placeName,
        address,
      } = req.body;

      if (!categoryId) requiredField("category_id");
      if (!placeName) requiredField("place_name");
      if (!address) requiredField("address");

      const response = await createProposalsService({
        userId,
        categoryId,
        address,
        placeName,
      });

      return res.status(200).json({ ...response });
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      requestLog(req);
      const { userId } = req;
      const response = await updateProposalsService({ ...req.body, userId });
      return res.status(200).json({
        ...response,
      });
    } catch (err) {
      next(err);
    }
  }

  async getItems(req, res, next) {
    try {
      requestLog(req);
      const { id } = req.params;
      const { offset, limit } = req.query;
      const response = await getProposalsService({
        limit,
        offset,
        placeId: id,
      });
      return res.status(200).json(!id ? { items: response } : { ...response });
    } catch (err) {
      next(err);
    }
  }

  async remove(req, res, next) {
    try {
      requestLog(req);
      const { id } = req.body;
      if (!id) requiredField("id");
      await removeProposalsService(id);

      return res.status(200).json({});
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ProposalsController();
