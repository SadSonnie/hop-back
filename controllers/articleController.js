const articleService = require('../services/articleService');
const { requestLog } = require('../logger');

class ArticleController {
  async create(req, res, next) {
    try {
      requestLog(req);
      let articleData = req.body;
      
      if (req.file) {
        articleData.photo = req.file.filename;
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
      
      if (req.file) {
        updateData.photo = req.file.filename;
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