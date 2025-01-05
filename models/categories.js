"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Categories extends Model {
    static associate(models) {
      // Исправлена связь: категория принадлежит предложению места
      Categories.hasMany(models.PlaceProposals, {
        foreignKey: "category_id", // category_id в PlaceProposals
        as: "placeProposals", // Определение alias, чтобы проще было обращаться
      });
    }
  }

  Categories.init(
    {
      name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Categories",
    },
  );
  return Categories;
};
