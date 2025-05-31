'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class LocalAdvicePhotos extends Model {
    static associate(models) {
      LocalAdvicePhotos.belongsTo(models.LocalAdvice, {
        foreignKey: 'local_advice_id',
        onDelete: 'CASCADE'
      });
    }
  }
  
  LocalAdvicePhotos.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    local_advice_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    photo_url: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'LocalAdvicePhotos',
  });
  
  return LocalAdvicePhotos;
}; 