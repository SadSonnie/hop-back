"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Tags extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Tags.hasMany(models.PlaceTags, {
        foreignKey: "tag_id",
      });
      // Добавляем связь с контекстными тегами
      Tags.hasMany(models.ContextualTags, {
        foreignKey: 'parent_tag_id',
        as: 'contextualTags'
      });
    }
  }
  Tags.init(
    {
      name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Tags",
    },
  );
  return Tags;
};
