'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ContextualTags extends Model {
    static associate(models) {
      // Связь с основным тегом
      ContextualTags.belongsTo(models.Tags, {
        foreignKey: 'parent_tag_id',
        as: 'parentTag',
        onDelete: 'CASCADE'
      });
    }
  }
  
  ContextualTags.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    parent_tag_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Tags',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'ContextualTags',
  });
  
  return ContextualTags;
}; 