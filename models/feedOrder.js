'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FeedOrder extends Model {
    static associate(models) {
      // define association here
    }
  }
  
  FeedOrder.init({
    itemId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    itemType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'FeedOrder',
  });
  
  return FeedOrder;
};
