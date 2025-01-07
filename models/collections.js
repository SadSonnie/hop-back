"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Collections extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Collections.hasMany(models.CollectionPlace, {
        foreignKey: "collection_id",
        as: "places",
      });
    }
  }
  Collections.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true
      },
      name: DataTypes.STRING,
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: "Collections",
    },
  );
  return Collections;
};
