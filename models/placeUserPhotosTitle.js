'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PlaceUserPhotosTitle extends Model {
    static associate(models) {
      PlaceUserPhotosTitle.belongsTo(models.Places, {
        foreignKey: 'place_id',
        onDelete: 'CASCADE'
      });
    }
  }
  
  PlaceUserPhotosTitle.init({
    place_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'Places',
        key: 'id'
      }
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'PlaceUserPhotosTitle',
  });
  
  return PlaceUserPhotosTitle;
}; 