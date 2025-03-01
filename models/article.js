'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Article extends Model {
    static associate(models) {
      Article.belongsTo(models.Users, {
        foreignKey: 'author_id',
        as: 'author'
      });
      // TODO: Uncomment once ArticlePhotos model is created
      // Article.hasMany(models.ArticlePhotos, {
      //   foreignKey: 'article_id',
      //   as: 'photos',
      //   onDelete: 'CASCADE'
      // });
    }
  }
  
  Article.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    photo_url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    is_recommended: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_visible: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    author_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Article',
    underscored: true
  });
  
  return Article;
};