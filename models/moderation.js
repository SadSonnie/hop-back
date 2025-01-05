"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Moderation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Moderation.belongsTo(models.User, {
        foreignKey: "user_id",
        onDelete: "CASCADE",
      });
    }
  }
  Moderation.init(
    {
      user_id: DataTypes.INTEGER,
      action: DataTypes.STRING,
      target_type: DataTypes.STRING,
      target_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Moderation",
    },
  );
  return Moderation;
};
