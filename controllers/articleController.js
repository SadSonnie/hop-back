const articleService = require('../services/articleService');
const { requestLog } = require('../logger');

class ArticleController {
  async create(req, res, next) {
    try {
      requestLog(req);
      let articleData = req.body;
      
      // Парсим JSON контент, если он передан как строка
      if (typeof articleData.content === 'string') {
        try {
          articleData.content = JSON.parse(articleData.content);
        } catch (e) {
          throw new Error('Invalid content JSON format');
        }
      }

      // Обрабатываем загруженные фото
      if (req.files && req.files.photos) {
        const photoFiles = req.files.photos;
        const photoBlocks = {};

        // Создаем объект с информацией о загруженных фото
        photoFiles.forEach(file => {
          const blockId = file.originalname.split('_')[0]; // Предполагаем, что имя файла начинается с ID блока
          photoBlocks[blockId] = file.filename;
        });

        articleData.photoBlocks = photoBlocks;
      }
      
      const article = await articleService.create(articleData, req.user.id);
      res.json(article);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      requestLog(req);
      const article = await articleService.findById(req.params.id);
      res.json(article);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      requestLog(req);
      const articles = await articleService.findAll(req.query);
      res.json(articles);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      requestLog(req);
      let updateData = req.body;

      // Парсим JSON контент, если он передан как строка
      if (typeof updateData.content === 'string') {
        try {
          updateData.content = JSON.parse(updateData.content);
        } catch (e) {
          throw new Error('Invalid content JSON format');
        }
      }
      
      // Обрабатываем загруженные фото
      if (req.files && req.files.photos) {
        const photoFiles = req.files.photos;
        const photoBlocks = {};

        // Создаем объект с информацией о загруженных фото
        photoFiles.forEach(file => {
          const blockId = file.originalname.split('_')[0]; // Предполагаем, что имя файла начинается с ID блока
          photoBlocks[blockId] = file.filename;
        });

        updateData.photoBlocks = photoBlocks;
      }
      
      const article = await articleService.update(req.params.id, updateData);
      res.json(article);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      requestLog(req);
      const result = await articleService.delete(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ArticleController();