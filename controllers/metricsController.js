const { requiredField } = require("../errorMessages");
const { requestLog } = require("../logger");
const { calculateMetric } = require("../services/dataMetricService");

const {
  getMetricsSerice,
  createMetricsSerice,
  removeMetricsSerice,
  updateMetricsService,
  generateMetricsService,
} = require("../services/metricsService");



class MetricsController {
  async getItems(req, res, next) {
    try {
      requestLog(req);
      const { offset, limit } = req.query;
      const { id } = req.params;

      const response = await getMetricsSerice({ id, offset, limit });
      return res.status(200).json(!id ? { items: response } : { ...response });
    } catch (err) {
      next(err);
    }
  }
  async create(req, res, next) {
    try {
      requestLog(req);
      const { description, metric_name } = req.body;
      if (!metric_name) requiredField("metric_name");
      if (!description) requiredField("description");

      const response = await createMetricsSerice({ metric_name, description });
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
      const response = await updateMetricsService(req.body);
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
      await removeMetricsSerice({ id });
      return res.status(200).json({});
    } catch (err) {
      next(err);
    }
  }

  async generate(req, res, next) {
    try {
      requestLog(req);
      const response = await generateMetricsService();
      return res.status(200).json({ ...response });
    } catch (err) {
      next(err);
    }
  }

  async formData(req, res, next) {
    try {
      requestLog(req);
      const { 
        userId, 
        type,
        active = 0, 
        period_start, 
        period_end 
      } = req.query;

      if(!type) requiredField('type')
      const response = await calculateMetric({userId, type, active, period_start, period_end})
      return res.status(200).json({...response});
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new MetricsController();
