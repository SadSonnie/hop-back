"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CollectionPlace extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      CollectionPlace.belongsTo(models.Places, {
        foreignKey: "place_id",
        as: "placesItems",
        onDelete: "CASCADE",
      });
      CollectionPlace.belongsTo(models.Collections, {
        foreignKey: "collection_id",
        onDelete: "CASCADE",
      });
    }
  }
  CollectionPlace.init(
    {
      collection_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: 'Collections',
          key: 'id'
        }
      },
      place_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: 'Places',
          key: 'id'
        }
      }
    },
    {
      sequelize,
      modelName: "CollectionPlace",
    },
  );
  return CollectionPlace;
};
