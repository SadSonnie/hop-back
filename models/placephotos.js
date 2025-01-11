'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PlacePhotos extends Model {
    static associate(models) {
      PlacePhotos.belongsTo(models.Places, {
        foreignKey: 'place_id',
        onDelete: 'CASCADE'
      });
    }
  }
  
  PlacePhotos.init({
    place_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    photo_url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    is_main: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'PlacePhotos',
  });
  
  return PlacePhotos;
};
