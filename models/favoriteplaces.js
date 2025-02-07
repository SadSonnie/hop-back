'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FavoritePlaces extends Model {
    static associate(models) {
      FavoritePlaces.belongsTo(models.Users, {
        foreignKey: 'user_id',
        onDelete: 'CASCADE'
      });
      FavoritePlaces.belongsTo(models.Places, {
        foreignKey: 'place_id',
        onDelete: 'CASCADE'
      });
    }
  }

  FavoritePlaces.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    place_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'FavoritePlaces',
    tableName: 'favorite_places'
  });

  return FavoritePlaces;
};
