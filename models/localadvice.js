'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class LocalAdvice extends Model {
    static associate(models) {
      LocalAdvice.belongsTo(models.Places, {
        foreignKey: 'place_id',
        onDelete: 'CASCADE'
      });
      LocalAdvice.hasMany(models.LocalAdvicePhotos, {
        foreignKey: 'local_advice_id',
        as: 'LocalAdvicePhotos',
        onDelete: 'CASCADE'
      });
    }
  }
  
  LocalAdvice.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    place_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    author_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    author_nickname: {
      type: DataTypes.STRING,
      allowNull: true
    },
    occupation: {
      type: DataTypes.STRING,
      allowNull: true
    },
    link: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'LocalAdvice',
  });
  
  return LocalAdvice;
}; 