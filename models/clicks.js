'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Clicks extends Model {
    static associate(models) {
      Clicks.belongsTo(models.Places, {
        foreignKey: 'place_id',
        as: 'place'
      });
    }
  }

  Clicks.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    place_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    click_type: {
      type: DataTypes.ENUM(
        'social_instagram',
        'social_telegram',
        'social_vk',
        'social_website',
        'story',
        'video',
        'guide_link',
        'user_photo'
      ),
      allowNull: false
    },
    target_id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    source: {
      type: DataTypes.STRING,
      allowNull: true
    },
    clicked_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Clicks',
  });

  return Clicks;
}; 