const { notFoundError } = require("../errorMessages");
const ApiError = require("../exceptions/apiError");
const { metricsData } = require("../utils");

const { Metrics } = require("../models");

const returnedValue = (metric) => {
  return {
    id: metric.id,
    metric_name: metric.metric_name,
    description: metric.description,
  };
};

const getMetricsSerice = async ({ id, limit, offset }) => {
  try {
    if (id) {
      const metric = await Metrics.findByPk(id);
      if (!metric) throw new Error();

      return returnedValue(metric);
    } else {
      const metrics = await Metrics.findAll({
        limit,
        offset,
        order: [["createdAt", "DESC"]],
      });

      return metrics.map((metric) => returnedValue(metric));
    }
  } catch (err) {
    notFoundError("Metric", id);
  }
};

const createMetricsSerice = async ({ metric_name, description }) => {
  try {
    const metric = await Metrics.create({ metric_name, description });

    return returnedValue(metric);
  } catch (err) {
    throw ApiError.UnauthorizedError();
  }
};
const updateMetricsService = async ({ id, ...data }) => {
  try {
    const metric = await Metrics.findByPk(id);
    if (!metric) throw new Error();

    const updatedMetric = await metric.update({ ...data });

    return returnedValue(updatedMetric);
  } catch (err) {
    notFoundError("Metric", id);
  }
};
const removeMetricsSerice = async ({ id }) => {
  try {
    const metric = await Metrics.destroy({
      where: {
        id,
      },
    });
    if (!metric) throw new Error();
  } catch (err) {
    notFoundError("Metric", id);
  }
};

const generateMetricsService = async () => {
  try {
    const allMetrics = [];
    for (const metric of metricsData) {
      const currMetric = await Metrics.findOne({
        where: {
          metric_name: metric.name,
        },
      });
      if (!currMetric) {
        const newMetric = await Metrics.create({
          metric_name: metric.name,
          description: metric.description,
        });
        allMetrics.push({
          id: newMetric.id,
          metric_name: newMetric.metric_name,
          description: newMetric.description,
        });
      } else {
        allMetrics.push({
          id: currMetric.id,
          metric_name: currMetric.metric_name,
          description: currMetric.description,
        });
      }
    }

    return {
      items: allMetrics,
    };
  } catch (err) {
    throw ApiError.UnauthorizedError();
  }
};

module.exports = {
  getMetricsSerice,
  createMetricsSerice,
  updateMetricsService,
  removeMetricsSerice,
  generateMetricsService,
};
