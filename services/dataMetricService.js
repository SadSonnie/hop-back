const { Metrics, MetricsData, User,} = require("../models");
const { Op, Sequelize } = require("sequelize")
const {logger} = require("../logger");
const { typeExist } = require("../utils");
const ApiError = require("../exceptions/apiError");
const { notFoundError } = require("../errorMessages");


const SESSION_TIME = process.env.SESSION_TIME || 300;

const sessionDataMetric = async ({ userId }) => {
  try {

    const user = await User.findOne({ where: { tg_id: userId } });
    if (!user) return;

    const metrics = await Metrics.findOne({ where: { metric_name: "avg_usage_time" } });
    if (!metrics) return;

    const latestMetricData = await MetricsData.findOne({
      where: { user_id: user.id, metric_id: metrics.id },
      order: [["createdAt", "DESC"]],
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

      const sessionDuration = (now - new Date(latestMetricData.createdAt)) / 1000; 
      
      await latestMetricData.update({ value: Math.floor(sessionDuration) });
      return latestMetricData;
    }
  } catch (err) {
    logger.error("Error in sessionDataMetric:", err);
  }
};

const calculateAverage = (arr) => {
  if (arr.length === 0) return 0; 

  const sum = arr.reduce((acc, data) => acc + data.value, 0); 
  const average = sum / arr.length; 
  return average;
}

const replaceTypeList = [
  'total_users'
]

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

// Кол-во юзеров в приложении
// active = 1 - которые сейчас онлайн
// Если period_start и period_end не указаны, то за последний месяц
const calculateMetricUsers = async ({ metric, active = false, period_start, period_end }) => {
  try {

    const whereCondition = { metric_id: metric.id };


    if (active) {
      const fiveMinutesAgo = new Date(new Date() - 5 * 60 * 1000);
      whereCondition.updatedAt = { [Op.gte]: fiveMinutesAgo };
    }


    if (period_start && period_end) {
      whereCondition.createdAt = { [Op.between]: [period_start, period_end] };
    } else if (period_start) {
      whereCondition.createdAt = { [Op.gte]: period_start };
    } else if (period_end) {
      whereCondition.createdAt = { [Op.lte]: period_end };
    } else {

      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1); 
      whereCondition.createdAt = { [Op.gte]: oneMonthAgo }; 
    }


    const metricsData = await MetricsData.findAll({
      attributes: [
        "user_id",
        [Sequelize.fn("MAX", Sequelize.col("updatedAt")), "last_updated"],
        [Sequelize.fn("MAX", Sequelize.col("createdAt")), "last_created"],
      ],
      where: whereCondition,
      group: ["user_id"], // Группировка по user_id
      order: [[Sequelize.fn("MAX", Sequelize.col("updatedAt")), "DESC"]],
    });


    const uniqueUsers = metricsData.map((data) => ({
      user_id: data.user_id,
      last_updated: data.getDataValue("last_updated"),
      last_created: data.getDataValue("last_created"),
    }));

    return { total: uniqueUsers.length };
  } catch (err) {
    console.error("Error in calculateMetricUsers:", err);
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


const calculateMetric = async ({userId, type, active, period_start, period_end}) => {
  try {
    if(!typeExist.includes(type)) throw new Error('type')

    let currType = type;

    if(replaceTypeList.includes(type)) {
      currType = 'avg_usage_time'
    }
    let metric = {}
    if(!ignoreTypeList.includes(type)) {
      metric = await Metrics.findOne({where: {metric_name: currType}})
      if(!type) throw new Error('type_not_found')
    }
    
    
    let user_id = null
    if(userId) {
      const user = await User.findOne({ where: { tg_id: userId } });
      if (!user) throw new Error('user');

      user_id = user.id
    }


    let res = {}
    switch(type) {
      case 'avg_usage_time': 
        res = await calculateMetricSession({user_id, metric});
        break;
      case 'total_users': 
        res = await calculateMetricUsers({metric, active, period_start, period_end});
        break;
      case 'new_users_per_month': 
        res = await calculateMetricNewUsers();
        break;
      default:
        res = {};
    }

    return res

  } catch (err) {
    const msg = err.message;
    if(msg == 'type') throw ApiError.BadRequest(`Type "${type}" does not exist`)
    if(msg == 'type_not_found') throw ApiError.NotFound(`Type "${type}" not found`)
    if(msg == 'user') notFoundError('User', userId)
  }
}

module.exports = {
  sessionDataMetric,
  calculateMetric
};
