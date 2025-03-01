const { Article, Users } = require('../models');
const { Op } = require('sequelize');
const ApiError = require('../exceptions/apiError');

const getPhotoUrl = (filename) => {
  if (!filename) return null;
  const cleanFilename = filename.replace(/^uploads\//, '');
  return `${process.env.API_URL}/uploads/${cleanFilename}`;
};

class ArticleService {
  async create(articleData, authorId) {
    if (articleData.photo) {
      articleData.photo_url = getPhotoUrl(articleData.photo);
    }
    return await Article.create({
      ...articleData,
      author_id: authorId
    });
  }

  async findById(id) {
    const article = await Article.findByPk(id, {
      include: [{
        model: Users,
        as: 'author',
        attributes: ['id', 'tg_id', 'role']
      }]
    });
    
    if (!article) {
      throw ApiError.NotFound('Статья не найдена');
    }
    
    return article;
  }

  async findAll(query = {}) {
    const { page = 1, limit = 10, is_recommended, is_visible } = query;
    const offset = (page - 1) * limit;
    
    const where = {};
    if (typeof is_recommended === 'boolean') where.is_recommended = is_recommended;
    if (typeof is_visible === 'boolean') where.is_visible = is_visible;

    return await Article.findAndCountAll({
      where,
      include: [{
        model: Users,
        as: 'author',
        attributes: ['id', 'tg_id', 'role']
      }],
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });
  }

  async update(id, data) {
    const article = await this.findById(id);
    if (data.photo) {
      data.photo_url = getPhotoUrl(data.photo);
      delete data.photo;
    }
    return await article.update(data);
  }

  async delete(id) {
    const article = await this.findById(id);
    await article.destroy();
    return { message: 'Статья успешно удалена' };
  }
}

module.exports = new ArticleService();