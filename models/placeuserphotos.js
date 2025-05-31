'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PlaceUserPhotos extends Model {
    static associate(models) {
      PlaceUserPhotos.belongsTo(models.Places, {
        foreignKey: 'place_id',
        onDelete: 'CASCADE'
      });
    }
  }
  
  PlaceUserPhotos.init({
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    place_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    photo_url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    author_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    caption: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    link: {
      type: DataTypes.STRING,
      allowNull: true
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'PlaceUserPhotos',
  });
  
  return PlaceUserPhotos;
}; 