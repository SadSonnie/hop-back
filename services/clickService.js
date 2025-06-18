const { Clicks, sequelize } = require('../models');
const { Op } = require('sequelize');
const ApiError = require('../exceptions/apiError');

class ClickService {
  // Добавить клик
  static async addClick(placeId, clickType, targetId = null, source = null) {
    return Clicks.create({
      place_id: placeId,
      click_type: clickType,
      target_id: targetId,
      source: source,
      clicked_at: new Date()
    });
  }

  // Получить статистику кликов по месту
  static async getPlaceClickStats(placeId, period = 'all', startDate = null, endDate = null) {
    const whereCondition = {};
    let periodDate = null;
    
    if (placeId) {
      whereCondition.place_id = placeId;
    }
    
    // Если указаны start_date и end_date, используем их
    if (startDate && endDate) {
      whereCondition.clicked_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    // Иначе используем period если он не 'all'
    else if (period !== 'all') {
      periodDate = new Date();
      switch(period) {
        case 'day':
          periodDate.setDate(periodDate.getDate() - 1);
          break;
        case 'week':
          periodDate.setDate(periodDate.getDate() - 7);
          break;
        case 'month':
          periodDate.setMonth(periodDate.getMonth() - 1);
          break;
      }
      whereCondition.clicked_at = {
        [Op.gte]: periodDate
      };
    }

    const stats = await Clicks.findAll({
      attributes: [
        'click_type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'click_count']
      ],
      where: whereCondition,
      group: ['click_type'],
      raw: true
    });

    // Преобразуем результат в более удобный формат
    const result = {
      social: {
        instagram: 0,
        telegram: 0,
        vk: 0,
        website: 0
      },
      content: {
        story: 0,
        video: 0,
        guide_link: 0,
        user_photo: 0
      },
      total: 0,
      period: {
        start: startDate || (period !== 'all' ? periodDate : null),
        end: endDate || new Date(),
        type: startDate && endDate ? 'custom' : period
      }
    };

    stats.forEach(stat => {
      const count = parseInt(stat.click_count);
      if (stat.click_type.startsWith('social_')) {
        const network = stat.click_type.replace('social_', '');
        result.social[network] = count;
      } else {
        result.content[stat.click_type] = count;
      }
      result.total += count;
    });

    return result;
  }

  // Получить временной ряд кликов
  static async getClicksTimeSeries(placeId, clickType = null, days = 30) {
    const whereCondition = {
      place_id: placeId,
      clicked_at: {
        [Op.gte]: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      }
    };

    if (clickType) {
      whereCondition.click_type = clickType;
    }

    return Clicks.findAll({
      attributes: [
        [sequelize.fn('date_trunc', 'day', sequelize.col('clicked_at')), 'date'],
        'click_type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: whereCondition,
      group: [
        sequelize.fn('date_trunc', 'day', sequelize.col('clicked_at')),
        'click_type'
      ],
      order: [
        [sequelize.fn('date_trunc', 'day', sequelize.col('clicked_at')), 'ASC']
      ],
      raw: true
    });
  }
}

module.exports = ClickService; 