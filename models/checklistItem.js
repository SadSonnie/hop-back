'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ChecklistItem extends Model {
    static associate(models) {
      ChecklistItem.belongsToMany(models.User, {
        through: models.UserChecklistStatus,
        foreignKey: 'checklist_item_id',
        as: 'users'
      });
    }
  }

  ChecklistItem.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'ChecklistItem',
    tableName: 'checklist_items'
  });

  return ChecklistItem;
}; 