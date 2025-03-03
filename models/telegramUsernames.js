'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TelegramUsernames extends Model {
    static associate(models) {
      TelegramUsernames.belongsTo(models.Users, {
        foreignKey: 'user_id',
        onDelete: 'CASCADE'
      });
    }
  }

  TelegramUsernames.init({
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
    username: {
      type: DataTypes.STRING,
      allowNull: true
    },
    last_updated: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'TelegramUsernames'
  });

  TelegramUsernames.associate = function (models) {
    TelegramUsernames.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'User'
    });
  };

  return TelegramUsernames;
};