"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class MetricsData extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      MetricsData.belongsTo(models.Metrics, {
        foreignKey: "metric_id",
        onDelete: "CASCADE",
      });
      MetricsData.belongsTo(models.User, {
        foreignKey: "user_id",
        onDelete: "CASCADE",
      });
    }
  }
  MetricsData.init(
    {
      user_id: DataTypes.INTEGER,
      metric_id: DataTypes.INTEGER,
      value: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "MetricsData",
    },
  );
  return MetricsData;
};
