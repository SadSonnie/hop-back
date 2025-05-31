'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PlaceStoryPhotos extends Model {
    static associate(models) {
      PlaceStoryPhotos.belongsTo(models.Places, {
        foreignKey: 'place_id',
        onDelete: 'CASCADE'
      });
    }
  }
  
  PlaceStoryPhotos.init({
    place_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    photo_url: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'PlaceStoryPhotos',
  });
  
  return PlaceStoryPhotos;
}; 