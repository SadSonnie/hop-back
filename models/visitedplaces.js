'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class VisitedPlaces extends Model {
    static associate(models) {
      VisitedPlaces.belongsTo(models.Users, {
        foreignKey: 'user_id',
        onDelete: 'CASCADE'
      });
      VisitedPlaces.belongsTo(models.Places, {
        foreignKey: 'place_id',
        onDelete: 'CASCADE'
      });
    }
  }

  VisitedPlaces.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    place_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    visited_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'VisitedPlaces',
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'place_id']
      }
    ]
  });

  return VisitedPlaces;
};