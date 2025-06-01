'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Features extends Model {
    static associate(models) {
      Features.belongsToMany(models.Places, {
        through: 'PlaceFeatures',
        foreignKey: 'feature_id',
        as: 'places'
      });
      Features.belongsTo(models.FeatureCategory, {
        foreignKey: 'category_id',
        as: 'category'
      });
    }
  }
  
  Features.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'FeatureCategories',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Features',
  });
  
  return Features;
}; 