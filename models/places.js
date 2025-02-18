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
      Places.hasMany(models.PlacePhotos, {
        foreignKey: "place_id",
      });
      Places.belongsToMany(models.Users, {
        through: models.FavoritePlaces,
        foreignKey: 'place_id',
        as: 'favoritedBy'
      });
      // Добавляем связь с Reviews и каскадное удаление
      Places.hasMany(models.Reviews, {
        foreignKey: "place_id",
        as: 'reviews',
        onDelete: 'CASCADE'
      });
    }
  }
  Places.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true
      },
      name: DataTypes.STRING,
      address: DataTypes.STRING,
      category_id: DataTypes.INTEGER,
      description: DataTypes.TEXT,
      isPremium: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      priceLevel: DataTypes.INTEGER,
      latitude: DataTypes.DECIMAL(10, 8),
      longitude: DataTypes.DECIMAL(11, 8),
      phone: DataTypes.STRING,
      status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending',
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: "Places",
    },
  );
  return Places;
};
