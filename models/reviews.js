'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Reviews extends Model {
    static associate(models) {
      Reviews.belongsTo(models.Users, {
        foreignKey: 'user_id',
        as: 'author'
      });
      Reviews.belongsTo(models.Users, {
        foreignKey: 'moderated_by',
        as: 'moderator'
      });
      Reviews.belongsTo(models.Places, {
        foreignKey: 'place_id',
        as: 'place'
      });
      Reviews.hasMany(models.ReviewPhotos, {
        foreignKey: 'review_id',
        as: 'photos'
      });
    }
  }

  Reviews.init({
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
    place_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'Places',
        key: 'id'
      }
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
      allowNull: false
    },
    moderated_by: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    moderated_at: {
      type: DataTypes.DATE
    },
    original_title: {
      type: DataTypes.STRING(255)
    },
    original_content: {
      type: DataTypes.TEXT
    }
  }, {
    sequelize,
    modelName: 'Reviews',
    timestamps: true
  });

  return Reviews;
};
