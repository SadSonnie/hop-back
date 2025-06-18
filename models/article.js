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
      allowNull: true,
      defaultValue: '{"blocks":[]}',
      get() {
        const rawValue = this.getDataValue('content');
        if (!rawValue) return { blocks: [] };
        try {
          return JSON.parse(rawValue);
        } catch (e) {
          return {
            blocks: [{
              id: `block_${Date.now()}`,
              type: 'text',
              content: rawValue
            }]
          };
        }
      },
      set(value) {
        if (!value) {
          this.setDataValue('content', '{"blocks":[]}');
        } else if (typeof value === 'string') {
          try {
            // Try to parse it as JSON first
            JSON.parse(value);
            this.setDataValue('content', value);
          } catch (e) {
            // If it's not valid JSON, convert it to our block format
            this.setDataValue('content', JSON.stringify({
              blocks: [{
                id: `block_${Date.now()}`,
                type: 'text',
                content: value
              }]
            }));
          }
        } else {
          // If it's an object, stringify it
          this.setDataValue('content', JSON.stringify(value));
        }
      }
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
      allowNull: true,
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