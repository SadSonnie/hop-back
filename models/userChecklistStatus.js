'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserChecklistStatus extends Model {
    static associate(models) {
      UserChecklistStatus.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      UserChecklistStatus.belongsTo(models.ChecklistItem, {
        foreignKey: 'checklist_item_id',
        as: 'checklistItem'
      });
    }
  }

  UserChecklistStatus.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    checklist_item_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'checklist_items',
        key: 'id'
      }
    },
    completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'UserChecklistStatus',
    tableName: 'user_checklist_statuses'
  });

  return UserChecklistStatus;
}; 