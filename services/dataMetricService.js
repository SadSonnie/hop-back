const { Metrics, MetricsData, User, Places } = require("../models");
const { Op, Sequelize } = require("sequelize")
const {logger} = require("../logger");
const ApiError = require("../exceptions/apiError");
const { notFoundError } = require("../errorMessages");

const SESSION_TIME = process.env.SESSION_TIME || 300;

const typeExist = [
  'total_users',
  'avg_usage_time',
  'new_users_per_month',
  'total_places',
  'session_stats'
];

const sessionDataMetric = async ({ userId }) => {
  try {
    const user = await User.findOne({ where: { tg_id: userId } });
    if (!user) return;

    // Find or create the session_stats metric
    let metrics = await Metrics.findOne({ 
      where: { metric_name: 'session_stats' }
    });

    if (!metrics) {
      metrics = await Metrics.create({
        metric_name: 'session_stats',
        description: 'User session statistics including duration and count'
      });
    }

    const latestMetricData = await MetricsData.findOne({
      where: { 
        user_id: user.id, 
        metric_id: metrics.id 
      },
      order: [["createdAt", "DESC"]]
    });

    const now = new Date();

    if (!latestMetricData) {
      const newMetricData = await MetricsData.create({
        user_id: user.id,
        metric_id: metrics.id,
        value: 0,
      });
      return newMetricData;
    }

    const lastUpdated = new Date(latestMetricData.updatedAt);
    const timeDifference = (now - lastUpdated) / 1000;

    if (timeDifference > SESSION_TIME) {
      const newMetricData = await MetricsData.create({
        user_id: user.id,
        metric_id: metrics.id,
        value: 0,
      });
      return newMetricData;
    } else {
      const sessionDuration = Math.floor((now - new Date(latestMetricData.createdAt)) / 1000);
      await latestMetricData.update({ 
        value: sessionDuration,
        updatedAt: now // Explicitly update the timestamp
      });
      return latestMetricData;
    }
  } catch (err) {
    logger.error("Error in sessionDataMetric:", err);
    throw err;
  }
};

const calculateAverage = (arr) => {
  if (arr.length === 0) return 0; 

  const sum = arr.reduce((acc, data) => acc + data.value, 0); 
  const average = sum / arr.length; 
  return average;
}

const replaceTypeList = []

const ignoreTypeList = [
  'new_users_per_month'
]


// Сессии юзеров
// Если user_id, то конктректного пользователя
// Среднее время посещения аппа
const calculateMetricSession = async ({user_id, metric}) => {
      
  const reqData = {
    metric_id: metric.id
  }

  if(user_id) {
    reqData.user_id = user_id
  }

  const metricsData = await MetricsData.findAll({
    where: {
      ...reqData
    },
    attributes: ["id", "value", "metric_id", "user_id"],
    order: [["createdAt", "DESC"]],
  })

  return {
    metric_id: metric.id,
    metric_name: metric.metric_name,
    metric_description: metric.description,
    value: calculateAverage(metricsData)
  }
}

// Расчет метрик по сессиям пользователей
const calculateMetricSessionStats = async ({ period_start, period_end }) => {
  try {
    // Find or create the metric first
    let metric = await Metrics.findOne({ 
      where: { metric_name: 'session_stats' }
    });

    if (!metric) {
      logger.info('Creating session_stats metric');
      metric = await Metrics.create({
        metric_name: 'session_stats',
        description: 'User session statistics including duration and count'
      });
    }

    // Check if we have any session data
    const sessionCount = await MetricsData.count({
      where: { metric_id: metric.id }
    });

    // If no data exists, generate mock data
    if (sessionCount === 0) {
      logger.info('No session data found, generating mock data...');
      
      // Get users to distribute sessions among them
      const users = await User.findAll();
      if (users.length === 0) {
        logger.info('No users found, returning empty stats');
        return {
          current: {
            total_sessions: 0,
            total_time: 0,
            average_time: 0,
            active_sessions: 0
          },
          history: []
        };
      }

      const now = new Date();
      const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
      const mockSessions = [];

      // Generate sessions for the past 30 days
      for (let day = 0; day < 30; day++) {
        const date = new Date(thirtyDaysAgo.getTime() + day * 24 * 60 * 60 * 1000);
        const sessionsPerDay = Math.floor(Math.random() * 11) + 10; // 10-20 sessions per day
        
        for (let i = 0; i < sessionsPerDay; i++) {
          const user = users[Math.floor(Math.random() * users.length)];
          const sessionDuration = Math.floor(Math.random() * 3600) + 300; // 5-65 minutes
          const sessionStart = new Date(date.getTime() + Math.random() * 24 * 60 * 60 * 1000);
          
          mockSessions.push({
            user_id: user.id,
            metric_id: metric.id,
            value: sessionDuration,
            createdAt: sessionStart,
            updatedAt: new Date(sessionStart.getTime() + sessionDuration * 1000)
          });
        }
      }

      // Add some active sessions
      const activeSessionsCount = Math.floor(Math.random() * 5) + 3; // 3-7 active sessions
      for (let i = 0; i < activeSessionsCount; i++) {
        const user = users[Math.floor(Math.random() * users.length)];
        const sessionDuration = Math.floor(Math.random() * 300); // 0-5 minutes
        const sessionStart = new Date(now - sessionDuration * 1000);
        
        mockSessions.push({
          user_id: user.id,
          metric_id: metric.id,
          value: sessionDuration,
          createdAt: sessionStart,
          updatedAt: now
        });
      }

      // Insert mock sessions
      await MetricsData.bulkCreate(mockSessions);
      logger.info(`Generated ${mockSessions.length} mock sessions`);
    }

    // Build the where condition
    let whereCondition = {
      metric_id: metric.id
    };
    
    if (period_start && period_end) {
      whereCondition.createdAt = {
        [Op.between]: [new Date(period_start), new Date(period_end)]
      };
    }

    // Get all session data
    const sessions = await MetricsData.findAll({
      where: whereCondition,
      order: [['createdAt', 'ASC']],
      raw: true
    });

    logger.info(`Found ${sessions.length} session records`);

    if (sessions.length === 0) {
      return {
        current: {
          total_sessions: 0,
          total_time: 0,
          average_time: 0,
          active_sessions: 0
        },
        history: []
      };
    }

    // Group sessions by day
    const sessionsByDay = {};
    sessions.forEach(session => {
      const date = new Date(session.createdAt).toISOString().split('T')[0];
      if (!sessionsByDay[date]) {
        sessionsByDay[date] = {
          sessions: [],
          totalTime: 0,
          count: 0
        };
      }
      sessionsByDay[date].sessions.push(session.value);
      sessionsByDay[date].totalTime += session.value;
      sessionsByDay[date].count++;
    });

    // Calculate totals and generate history
    let totalSessions = 0;
    let totalTime = 0;

    const history = Object.entries(sessionsByDay).map(([date, data]) => {
      totalSessions += data.count;
      totalTime += data.totalTime;

      return {
        date,
        daily_stats: {
          sessions_count: data.count,
          total_time: data.totalTime,
          average_time: Math.round(data.totalTime / data.count),
          min_time: Math.min(...data.sessions),
          max_time: Math.max(...data.sessions)
        },
        cumulative_stats: {
          total_sessions: totalSessions,
          total_time: totalTime,
          average_time: Math.round(totalTime / totalSessions)
        }
      };
    });

    // Get active sessions (sessions updated within SESSION_TIME seconds)
    const now = new Date();
    const activeSessionsCount = await MetricsData.count({
      where: {
        metric_id: metric.id,
        updatedAt: {
          [Op.gte]: new Date(now - SESSION_TIME * 1000)
        }
      }
    });

    logger.info(`Active sessions: ${activeSessionsCount}`);

    return {
      current: {
        total_sessions: totalSessions,
        total_time: totalTime,
        average_time: totalSessions > 0 ? Math.round(totalTime / totalSessions) : 0,
        active_sessions: activeSessionsCount
      },
      history: history.sort((a, b) => new Date(a.date) - new Date(b.date))
    };
  } catch (error) {
    logger.error('Error in calculateMetricSessionStats:', error);
    throw error;
  }
};

// Кол-во юзеров в приложении
// active = true - только активные пользователи (были активны в последний месяц)
const calculateMetricUsers = async ({ active = false, period_start, period_end }) => {
  try {
    let whereCondition = {};
    
    // If period is specified, use it for filtering
    if (period_start && period_end) {
      whereCondition.createdAt = {
        [Op.between]: [new Date(period_start), new Date(period_end)]
      };
    }
    
    if (active) {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      whereCondition.updatedAt = { [Op.gte]: oneMonthAgo };
    }

    // Get total users based on conditions
    const totalUsers = await User.count({ where: whereCondition });
    
    // Get active users count
    const activeUsers = active ? totalUsers : await User.count({
      where: {
        ...whereCondition,
        updatedAt: { 
          [Op.gte]: new Date(new Date() - 30 * 24 * 60 * 60 * 1000) 
        }
      }
    });

    // Get daily statistics for all time
    const dailyStats = await User.findAll({
      attributes: [
        [Sequelize.fn('date', Sequelize.col('createdAt')), 'date'],
        [Sequelize.fn('count', Sequelize.col('id')), 'count']
      ],
      where: whereCondition,
      group: [Sequelize.fn('date', Sequelize.col('createdAt'))],
      order: [[Sequelize.fn('date', Sequelize.col('createdAt')), 'ASC']],
      raw: true
    });

    // Calculate cumulative growth
    let cumulativeCount = 0;
    const historicalGrowth = dailyStats.map(stat => {
      cumulativeCount += parseInt(stat.count);
      return {
        date: stat.date,
        new_users: parseInt(stat.count),
        total_users: cumulativeCount
      };
    });

    return { 
      current: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
      },
      history: historicalGrowth
    };
  } catch (err) {
    logger.error("Error in calculateMetricUsers:", err);
    throw err;
  }
};

// Активное время посещения аппа
const calculateMetricActiveTimeOfDay = async ({}) => {
  const metricsData = await MetricsData.findAll({
    
  })
}

// Новые пользователи за текущий месяц
const calculateMetricNewUsers = async () => {

  const currentDate = new Date();


  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);


  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);


  const users = await User.findAll({
    where: {
      createdAt: {
        [Op.gte]: startOfMonth, 
        [Op.lte]: endOfMonth,  
      },
    },
  });

  return {
    items: users.map(user => ({id: user.id, role: user.role, tg_id: user.tg_id})),
    totalCount: users.length
  }
};

// Статистика по заведениям
const calculateMetricPlaces = async ({ period_start, period_end }) => {
  try {
    let whereCondition = {};
    
    if (period_start && period_end) {
      whereCondition.createdAt = {
        [Op.between]: [new Date(period_start), new Date(period_end)]
      };
    }

    // Get total places count
    const totalPlaces = await Places.count({ where: whereCondition });

    // Get places by status
    const placesByStatus = await Places.count({
      where: whereCondition,
      group: ['status'],
      attributes: ['status', [Sequelize.fn('count', Sequelize.col('id')), 'count']],
      raw: true
    });

    // Get daily statistics
    const dailyStats = await Places.findAll({
      attributes: [
        [Sequelize.fn('date', Sequelize.col('createdAt')), 'date'],
        [Sequelize.fn('count', Sequelize.col('id')), 'count'],
        'status'
      ],
      where: whereCondition,
      group: [Sequelize.fn('date', Sequelize.col('createdAt')), 'status'],
      order: [[Sequelize.fn('date', Sequelize.col('createdAt')), 'ASC']],
      raw: true
    });

    // Process daily stats to include cumulative counts
    const historyByDate = {};
    let cumulativeCounts = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0
    };

    dailyStats.forEach(stat => {
      const date = stat.date;
      const count = parseInt(stat.count);
      const status = stat.status;

      if (!historyByDate[date]) {
        historyByDate[date] = {
          date,
          new_places: 0,
          total_places: 0,
          by_status: {
            pending: 0,
            approved: 0,
            rejected: 0
          }
        };
      }

      historyByDate[date].new_places += count;
      historyByDate[date].by_status[status] = count;
      
      cumulativeCounts.total += count;
      cumulativeCounts[status] += count;
      
      historyByDate[date].total_places = cumulativeCounts.total;
      historyByDate[date].cumulative_by_status = { ...cumulativeCounts };
    });

    return {
      current: {
        total: totalPlaces,
        by_status: {
          pending: placesByStatus.find(s => s.status === 'pending')?.count || 0,
          approved: placesByStatus.find(s => s.status === 'approved')?.count || 0,
          rejected: placesByStatus.find(s => s.status === 'rejected')?.count || 0
        }
      },
      history: Object.values(historyByDate)
    };
  } catch (err) {
    logger.error("Error in calculateMetricPlaces:", err);
    throw err;
  }
};

const calculateMetric = async ({userId, type, active, period_start, period_end}) => {
  try {
    if(!typeExist.includes(type)) throw new Error('type')

    // Special handling for total_places which doesn't require a metric record
    if (type === 'total_places') {
      return calculateMetricPlaces({ period_start, period_end });
    }

    // Special handling for session_stats
    if (type === 'session_stats') {
      return calculateMetricSessionStats({ period_start, period_end });
    }

    const metric = await Metrics.findOne({
      where: {
        metric_name: type
      }
    })

    if(!metric) throw new Error('metric')

    switch(type) {
      case 'total_users':
        return calculateMetricUsers({ active, period_start, period_end });
      case 'avg_usage_time': 
        const user_id = userId ? (await User.findOne({ where: { tg_id: userId } })).id : null;
        return calculateMetricSession({user_id, metric});
      case 'new_users_per_month': 
        return calculateMetricNewUsers();
      default:
        throw new Error('type');
    }
  } catch(err) {
    if(err.message === 'type') {
      throw ApiError.BadRequest('Неверный тип метрики')
    }
    if(err.message === 'metric') {
      throw ApiError.BadRequest('Метрика не найдена')
    }
    throw err;
  }
}

const generateMockSessionData = async () => {
  try {
    // Find or create the session_stats metric
    let metrics = await Metrics.findOne({ 
      where: { metric_name: "session_stats" }
    });

    if (!metrics) {
      logger.info('Creating session_stats metric');
      metrics = await Metrics.create({
        metric_name: 'session_stats',
        description: 'User session statistics including duration and count'
      });
    }

    // Get all users to distribute sessions among them
    const users = await User.findAll();
    if (!users.length) {
      throw new Error("No users found to generate mock data");
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    // Generate random sessions for the past 30 days
    const mockSessions = [];
    for (let day = 0; day < 30; day++) {
      const date = new Date(thirtyDaysAgo.getTime() + day * 24 * 60 * 60 * 1000);
      
      // Generate 5-15 sessions per day
      const sessionsPerDay = Math.floor(Math.random() * 11) + 5;
      
      for (let i = 0; i < sessionsPerDay; i++) {
        const user = users[Math.floor(Math.random() * users.length)];
        const sessionDuration = Math.floor(Math.random() * 3600) + 300; // 5-65 minutes
        
        mockSessions.push({
          user_id: user.id,
          metric_id: metrics.id,
          value: sessionDuration,
          createdAt: date,
          updatedAt: new Date(date.getTime() + sessionDuration * 1000)
        });
      }
    }

    // Generate some active sessions for the current time
    const activeSessionsCount = Math.floor(Math.random() * 5) + 1; // 1-5 active sessions
    for (let i = 0; i < activeSessionsCount; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const sessionDuration = Math.floor(Math.random() * 300); // 0-5 minutes
      
      mockSessions.push({
        user_id: user.id,
        metric_id: metrics.id,
        value: sessionDuration,
        createdAt: new Date(now - sessionDuration * 1000),
        updatedAt: now
      });
    }

    // Clear existing session data
    await MetricsData.destroy({
      where: { metric_id: metrics.id }
    });

    // Insert mock sessions
    await MetricsData.bulkCreate(mockSessions);

    return {
      message: "Mock session data generated successfully",
      sessionsCreated: mockSessions.length
    };
  } catch (error) {
    logger.error("Error generating mock session data:", error);
    throw error;
  }
};

module.exports = {
  sessionDataMetric,
  calculateMetric,
  generateMockSessionData
};
