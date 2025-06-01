'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FeatureCategory extends Model {
    static associate(models) {
      FeatureCategory.hasMany(models.Features, {
        foreignKey: 'category_id',
        as: 'features'
      });
    }
  }
  
  FeatureCategory.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  }, {
    sequelize,
    modelName: 'FeatureCategory',
  });
  
  return FeatureCategory;
}; 