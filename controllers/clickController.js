const ClickService = require('../services/clickService');
const { requestLog } = require('../logger');
const ApiError = require('../exceptions/apiError');

class ClickController {
  // Записать клик
  async recordClick(req, res, next) {
    try {
      requestLog(req);
      
      const { place_id, click_type, target_id } = req.body;
      const source = req.headers['user-agent'] ? 'web' : 'mobile';

      if (!place_id || !click_type) {
        throw ApiError.BadRequest('Missing required parameters');
      }

      const validClickTypes = [
        'social_instagram',
        'social_telegram',
        'social_vk',
        'social_website',
        'story',
        'video',
        'guide_link',
        'user_photo'
      ];

      if (!validClickTypes.includes(click_type)) {
        throw ApiError.BadRequest('Invalid click type');
      }

      await ClickService.addClick(place_id, click_type, target_id, source);
      
      return res.status(200).json({ success: true });
    } catch (err) {
      next(err);
    }
  }

  // Получить статистику кликов
  async getClickStats(req, res, next) {
    try {
      requestLog(req);
      
      const { place_id, period = 'all', start_date, end_date } = req.query;

      // Валидация дат если они указаны
      if ((start_date && !end_date) || (!start_date && end_date)) {
        throw ApiError.BadRequest('Both start_date and end_date must be provided together');
      }

      if (start_date && end_date) {
        // Проверяем что даты валидные
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          throw ApiError.BadRequest('Invalid date format. Use ISO 8601 format (e.g. 2024-03-26T00:00:00Z)');
        }

        if (startDate > endDate) {
          throw ApiError.BadRequest('start_date cannot be later than end_date');
        }
      }

      const stats = await ClickService.getPlaceClickStats(
        place_id ? parseInt(place_id) : null,
        period,
        start_date,
        end_date
      );
      
      return res.status(200).json(stats);
    } catch (err) {
      next(err);
    }
  }

  // Получить временной ряд кликов
  async getClicksTimeSeries(req, res, next) {
    try {
      requestLog(req);
      
      const { place_id, click_type, days = 30 } = req.query;

      if (!place_id) {
        throw ApiError.BadRequest('Missing place_id parameter');
      }

      const timeSeries = await ClickService.getClicksTimeSeries(
        place_id,
        click_type,
        parseInt(days)
      );
      
      return res.status(200).json({
        data: timeSeries,
        meta: {
          place_id,
          click_type: click_type || 'all',
          days: parseInt(days)
        }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ClickController(); 