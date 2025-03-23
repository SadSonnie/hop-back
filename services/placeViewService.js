const { PlaceViews, sequelize } = require('../models');
const { Op } = require('sequelize');

class PlaceViewService {
  // Добавить просмотр места
  static async addView(placeId, userId, source) {
    return PlaceViews.create({
      place_id: placeId,
      user_id: userId,
      source,
      viewed_at: new Date()
    });
  }

  // Получить общее количество просмотров места
  static async getTotalViews(placeId) {
    return PlaceViews.count({
      where: { place_id: placeId }
    });
  }

  // Получить количество уникальных просмотров
  static async getUniqueViews(placeId) {
    return PlaceViews.count({
      where: { place_id: placeId },
      distinct: true,
      col: 'user_id'
    });
  }

  // Получить просмотры за последние N часов
  static async getRecentViews(placeId, hours = 24) {
    return PlaceViews.count({
      where: {
        place_id: placeId,
        viewed_at: {
          [Op.gte]: new Date(Date.now() - hours * 60 * 60 * 1000)
        }
      }
    });
  }

  // Получить топ мест по просмотрам
  static async getTopPlaces(limit = 10, period = 'day') {
    const periodDate = new Date();
    switch(period) {
      case 'week':
        periodDate.setDate(periodDate.getDate() - 7);
        break;
      case 'month':
        periodDate.setMonth(periodDate.getMonth() - 1);
        break;
      default: // day
        periodDate.setDate(periodDate.getDate() - 1);
    }

    return PlaceViews.findAll({
      attributes: [
        'place_id',
        [sequelize.fn('COUNT', sequelize.col('id')), 'view_count']
      ],
      where: {
        viewed_at: {
          [Op.gte]: periodDate
        }
      },
      group: ['place_id'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
      limit
    });
  }

  // Получить полную статистику просмотров
  static async getFullStats() {
    const now = new Date();
    const dayAgo = new Date(now - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const stats = await PlaceViews.findAll({
      attributes: [
        'place_id',
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_views'],
        [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('user_id'))), 'unique_views'],
        [
          sequelize.fn('COUNT', 
            sequelize.literal(`CASE WHEN viewed_at >= '${dayAgo.toISOString()}' THEN 1 END`)
          ),
          'last_24h_views'
        ],
        [
          sequelize.fn('COUNT', 
            sequelize.literal(`CASE WHEN viewed_at >= '${weekAgo.toISOString()}' THEN 1 END`)
          ),
          'last_week_views'
        ],
        [
          sequelize.fn('COUNT', 
            sequelize.literal(`CASE WHEN viewed_at >= '${monthAgo.toISOString()}' THEN 1 END`)
          ),
          'last_month_views'
        ],
        [
          sequelize.fn('COUNT', 
            sequelize.literal(`CASE WHEN source = 'mobile' THEN 1 END`)
          ),
          'mobile_views'
        ],
        [
          sequelize.fn('COUNT', 
            sequelize.literal(`CASE WHEN source = 'web' THEN 1 END`)
          ),
          'web_views'
        ],
        [
          sequelize.fn('MAX', sequelize.col('viewed_at')),
          'last_view_at'
        ]
      ],
      group: ['place_id'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']]
    });

    return stats.map(stat => ({
      place_id: stat.place_id,
      total_views: parseInt(stat.get('total_views')),
      unique_views: parseInt(stat.get('unique_views')),
      last_24h_views: parseInt(stat.get('last_24h_views')),
      last_week_views: parseInt(stat.get('last_week_views')),
      last_month_views: parseInt(stat.get('last_month_views')),
      mobile_views: parseInt(stat.get('mobile_views')),
      web_views: parseInt(stat.get('web_views')),
      last_view_at: stat.get('last_view_at')
    }));
  }
}

module.exports = PlaceViewService;