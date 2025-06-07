'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class LocalAdvicePhotos extends Model {
    static associate(models) {
      LocalAdvicePhotos.belongsTo(models.LocalAdvice, {
        foreignKey: 'local_advice_id',
        as: 'LocalAdvice',
        onDelete: 'CASCADE',
        foreignKeyConstraint: true,
        constraints: false // Отключаем автоматическое создание ограничений
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
      allowNull: false,
      references: {
        model: 'LocalAdvice',
        key: 'id'
      }
    },
    photo_url: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'LocalAdvicePhotos',
    tableName: 'LocalAdvicePhotos'
  });
  
  return LocalAdvicePhotos;
}; 