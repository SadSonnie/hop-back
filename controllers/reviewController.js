const { Reviews, ReviewPhotos, Users, Places } = require('../models');
const { Op } = require('sequelize');
const ApiError = require("../exceptions/apiError.js");

const reviewController = {
  // Создание нового отзыва
  async create(req, res) {
    try {
      const { place_id, title, content, rating } = req.body;
      const photos = req.files;

      // Находим пользователя по tg_id
      const user = await Users.findOne({ where: { tg_id: req.userId } });
      if (!user) {
        throw ApiError.BadRequest('User not found');
      }

      // Создаем отзыв используя id пользователя
      const review = await Reviews.create({
        user_id: user.id,
        place_id,
        title,
        content,
        rating,
        status: 'pending'
      });

      // Если есть фотографии, сохраняем их
      if (photos && photos.length > 0) {
        if (photos.length > 5) {
          return res.status(400).json({ error: 'Maximum 5 photos allowed' });
        }

        const photoPromises = photos.map((photo, index) => {
          return ReviewPhotos.create({
            review_id: review.id,
            photo_url: photo.path,
            order: index + 1
          });
        });

        await Promise.all(photoPromises);
      }

      // Получаем отзыв со всеми фотографиями
      const reviewWithPhotos = await Reviews.findByPk(review.id, {
        include: [
          { model: ReviewPhotos, as: 'photos' }
        ]
      });

      res.status(201).json(reviewWithPhotos);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.status).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  },

  // Получение отзывов для места (только подтвержденные)
  async getPlaceReviews(req, res) {
    try {
      const { place_id } = req.params;
      const reviews = await Reviews.findAll({
        where: {
          place_id,
          status: 'approved'
        },
        include: [
          { model: ReviewPhotos, as: 'photos' },
          { 
            model: Users, 
            as: 'author',
            attributes: ['id', 'tg_id']
          }
        ],
        order: [
          ['createdAt', 'DESC'],
          [{ model: ReviewPhotos, as: 'photos' }, 'order', 'ASC']
        ]
      });

      res.json(reviews);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Получение отзывов для модерации (только для модераторов)
  async getPendingReviews(req, res) {
    try {
      const reviews = await Reviews.findAll({
        where: {
          status: 'pending'
        },
        include: [
          { model: ReviewPhotos, as: 'photos' },
          { 
            model: Users, 
            as: 'author',
            attributes: ['id', 'tg_id']
          },
          {
            model: Places,
            as: 'place'
          }
        ],
        order: [['createdAt', 'ASC']]
      });

      res.json(reviews);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Модерация отзыва (для модераторов)
  async moderateReview(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      const { status, title, content } = req.body;

      console.log('Searching for review with id:', id);
      
      // Находим модератора по tg_id
      const moderator = await Users.findOne({ where: { tg_id: req.userId } });
      if (!moderator) {
        throw ApiError.BadRequest('Moderator not found');
      }

      const review = await Reviews.findByPk(id);
      console.log('Found review:', review);
      
      if (!review) {
        return res.status(404).json({ error: 'Review not found' });
      }

      // Сохраняем оригинальный контент, если он был изменен
      if (title && title !== review.title) {
        review.original_title = review.title;
        review.title = title;
      }
      if (content && content !== review.content) {
        review.original_content = review.content;
        review.content = content;
      }

      review.status = status;
      review.moderated_by = moderator.id;
      review.moderated_at = new Date();

      console.log('Saving review with changes:', {
        status,
        moderated_by: moderator.id,
        moderated_at: review.moderated_at
      });

      await review.save();

      const updatedReview = await Reviews.findByPk(id, {
        include: [
          { model: ReviewPhotos, as: 'photos' },
          { 
            model: Users, 
            as: 'author',
            attributes: ['id', 'tg_id']
          }
        ]
      });

      res.json(updatedReview);
    } catch (error) {
      console.error('Error in moderateReview:', error);
      if (error instanceof ApiError) {
        res.status(error.status).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  },

  // Удаление отзыва (для модераторов)
  async deleteReview(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      
      // Используем транзакцию для атомарной операции
      const result = await Reviews.destroy({
        where: { id },
        // force: true гарантирует физическое удаление, а не soft delete
        force: true
      });

      if (result === 0) {
        return res.status(404).json({ error: 'Review not found' });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error in deleteReview:', error);
      res.status(400).json({ error: error.message });
    }
  },

  // Получение своих отзывов (для пользователя)
  async getUserReviews(req, res) {
    try {
      // Находим пользователя по tg_id
      const user = await Users.findOne({ where: { tg_id: req.userId } });
      if (!user) {
        throw ApiError.BadRequest('User not found');
      }

      const reviews = await Reviews.findAll({
        where: {
          user_id: user.id
        },
        include: [
          { model: ReviewPhotos, as: 'photos' },
          {
            model: Places,
            as: 'place'
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.json(reviews);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.status).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  }
};

module.exports = reviewController;
