'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PlaceFeatures extends Model {
    static associate(models) {
      PlaceFeatures.belongsTo(models.Places, {
        foreignKey: 'place_id',
        onDelete: 'CASCADE'
      });
      PlaceFeatures.belongsTo(models.Features, {
        foreignKey: 'feature_id',
        onDelete: 'CASCADE'
      });
    }
  }
  
  PlaceFeatures.init({
    place_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'Places',
        key: 'id'
      }
    },
    feature_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Features',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'PlaceFeatures',
    indexes: [
      {
        unique: true,
        fields: ['place_id', 'feature_id']
      }
    ]
  });
  
  return PlaceFeatures;
}; 