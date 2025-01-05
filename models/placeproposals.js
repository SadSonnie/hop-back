"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class PlaceProposals extends Model {
    static associate(models) {
      PlaceProposals.belongsTo(models.User, {
        foreignKey: "user_id",
        onDelete: "CASCADE",
      });

      PlaceProposals.belongsTo(models.Categories, {
        foreignKey: "category_id",
        onDelete: "CASCADE",
      });
    }
  }

  PlaceProposals.init(
    {
      user_id: DataTypes.INTEGER,
      place_name: DataTypes.STRING,
      category_id: DataTypes.INTEGER, // В этом случае category_id остается в PlaceProposals
      address: DataTypes.STRING,
      status: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "PlaceProposals",
    },
  );
  return PlaceProposals;
};
