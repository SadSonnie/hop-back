'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    static associate(models) {
      Users.hasMany(models.Collections, {
        foreignKey: 'user_id',
        as: 'collections'
      });
      Users.belongsToMany(models.Places, {
        through: models.FavoritePlaces,
        foreignKey: 'user_id',
        as: 'favoritePlaces'
      });
    }
  }

  Users.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    tg_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      unique: true
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'user'
    }
  }, {
    sequelize,
    modelName: 'Users'
  });

  return Users;
};
