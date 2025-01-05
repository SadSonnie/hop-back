"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Places extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Places.belongsTo(models.Categories, {
        foreignKey: "category_id",
        onDelete: "CASCADE",
      });
      Places.hasMany(models.PlaceTags, {
        foreignKey: "place_id",
      });
      Places.hasMany(models.CollectionPlace, {
        foreignKey: "place_id",
      });
    }
  }
  Places.init(
    {
      name: DataTypes.STRING,
      address: DataTypes.STRING,
      category_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Places",
    },
  );
  return Places;
};
