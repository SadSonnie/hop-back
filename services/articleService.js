const { Article, Users } = require('../models');
const { Op } = require('sequelize');
const ApiError = require('../exceptions/apiError');

const getPhotoUrl = (filename) => {
  if (!filename) return null;
  const cleanFilename = filename.replace(/^uploads\//, '');
  return `${process.env.API_URL}/uploads/${cleanFilename}`;
};

// Функция для генерации ID блока
const generateBlockId = () => `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Функция для получения первого фото из блоков
const getFirstPhotoUrl = (blocks) => {
  const photoBlock = blocks.find(block => block.type === 'photo' && block.content?.url);
  return photoBlock ? photoBlock.content.url : null;
};

class ArticleService {
  async create(articleData, authorId) {
    // Подготавливаем контент в формате блоков
    let content = articleData.content || { blocks: [] };
    
    // Если контент передан как текст, конвертируем его в блок
    if (typeof content === 'string') {
      content = {
        blocks: [
          {
            id: generateBlockId(),
            type: 'text',
            content: content
          }
        ]
      };
    }

    // Проверяем наличие ID у блоков и добавляем, если отсутствуют
    content.blocks = content.blocks.map(block => ({
      ...block,
      id: block.id || generateBlockId()
    }));

    // Обрабатываем фото для блоков
    if (articleData.photoBlocks) {
      content.blocks = content.blocks.map(block => {
        if (block.type === 'photo' && articleData.photoBlocks[block.id]) {
          return {
            ...block,
            content: {
              ...block.content,
              url: getPhotoUrl(articleData.photoBlocks[block.id])
            }
          };
        }
        return block;
      });
    }

    // Устанавливаем photo_url из первого фото в блоках
    const photo_url = getFirstPhotoUrl(content.blocks);

    return await Article.create({
      ...articleData,
      content,
      photo_url,
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
    
    // Если передан новый контент в виде блоков, используем его
    if (data.content && typeof data.content === 'object') {
      // Проверяем, что контент имеет правильную структуру
      if (!data.content.blocks || !Array.isArray(data.content.blocks)) {
        data.content = { blocks: [] };
      }
      
      // Проверяем наличие ID у блоков и добавляем, если отсутствуют
      data.content.blocks = data.content.blocks.map(block => ({
        ...block,
        id: block.id || generateBlockId()
      }));

      // Обрабатываем фото для блоков
      if (data.photoBlocks) {
        data.content.blocks = data.content.blocks.map(block => {
          if (block.type === 'photo' && data.photoBlocks[block.id]) {
            return {
              ...block,
              content: {
                ...block.content,
                url: getPhotoUrl(data.photoBlocks[block.id])
              }
            };
          }
          return block;
        });
      }

      // Устанавливаем photo_url из первого фото в блоках
      data.photo_url = getFirstPhotoUrl(data.content.blocks);
    } 
    // Если передан текстовый контент, конвертируем его в блок
    else if (data.content) {
      data.content = {
        blocks: [
          {
            id: generateBlockId(),
            type: 'text',
            content: data.content
          }
        ]
      };
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