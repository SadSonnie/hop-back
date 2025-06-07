'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PlaceContextualTags extends Model {
    static associate(models) {
      PlaceContextualTags.belongsTo(models.Places, {
        foreignKey: 'place_id'
      });
      PlaceContextualTags.belongsTo(models.ContextualTags, {
        foreignKey: 'contextual_tag_id',
        onDelete: 'CASCADE'
      });
    }
  }
  
  PlaceContextualTags.init({
    place_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'Places',
        key: 'id'
      }
    },
    contextual_tag_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ContextualTags',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'PlaceContextualTags',
    indexes: [
      {
        unique: true,
        fields: ['place_id', 'contextual_tag_id']
      }
    ]
  });
  
  return PlaceContextualTags;
}; 