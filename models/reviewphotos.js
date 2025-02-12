'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ReviewPhotos extends Model {
    static associate(models) {
      ReviewPhotos.belongsTo(models.Reviews, {
        foreignKey: 'review_id',
        onDelete: 'CASCADE'
      });
    }
  }

  ReviewPhotos.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    review_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Reviews',
        key: 'id'
      }
    },
    photo_url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    }
  }, {
    sequelize,
    modelName: 'ReviewPhotos',
    timestamps: true,
    hooks: {
      beforeCreate: async (photo, options) => {
        // Проверяем, что у отзыва не более 5 фотографий
        const photosCount = await ReviewPhotos.count({
          where: { review_id: photo.review_id }
        });
        if (photosCount >= 5) {
          throw new Error('Maximum 5 photos per review allowed');
        }
      }
    }
  });

  return ReviewPhotos;
};
