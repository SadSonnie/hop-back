"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CollectionPlace extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      CollectionPlace.belongsTo(models.Places, {
        foreignKey: "place_id",
        as: "placesItems",
        onDelete: "CASCADE",
      });
      CollectionPlace.belongsTo(models.Collections, {
        foreignKey: "collection_id",
        onDelete: "CASCADE",
      });
    }
  }
  CollectionPlace.init(
    {
      collection_id: DataTypes.INTEGER,
      place_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "CollectionPlace",
    },
  );
  return CollectionPlace;
};
