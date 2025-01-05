"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.PlaceProposals, {
        foreignKey: "user_id",
      });
      User.hasMany(models.Collections, {
        foreignKey: "user_id",
      });
      User.hasMany(models.MetricsData, {
        foreignKey: "user_id",
      });
      User.hasMany(models.Moderation, {
        foreignKey: "user_id",
      });
    }
  }
  User.init(
    {
      tg_id: DataTypes.INTEGER,
      role: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "User",
    },
  );
  return User;
};
