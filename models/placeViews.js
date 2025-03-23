'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PlaceViews extends Model {
    static associate(models) {
      PlaceViews.belongsTo(models.Places, {
        foreignKey: 'place_id',
        as: 'place'
      });
      PlaceViews.belongsTo(models.Users, {
        foreignKey: 'user_id',
        as: 'user'
      });
    }
  }

  PlaceViews.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    place_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    viewed_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    source: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'PlaceViews',
  });

  return PlaceViews;
};