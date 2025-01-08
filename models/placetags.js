"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class PlaceTags extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      PlaceTags.belongsTo(models.Places, {
        foreignKey: "place_id",
        
        onDelete: "CASCADE",
      });
      PlaceTags.belongsTo(models.Tags, {
        foreignKey: "tag_id",
        onDelete: "CASCADE",
        as: "placesItems",
      });
    }
  }
  PlaceTags.init(
    {
      place_id: DataTypes.BIGINT,
      tag_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "PlaceTags",
    },
  );
  return PlaceTags;
};
