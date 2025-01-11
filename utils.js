require("dotenv").config();
const ApiError = require("./exceptions/apiError.js");
const jwt = require("jsonwebtoken");
const multer = require("multer");

const generateToken = (payload, expiresIn) => {
  return jwt.sign({ ...payload }, process.env.SECRET_KEY, { expiresIn });
};

const verifyToken = (token) => {
  try {
    const data = jwt.verify(token, process.env.SECRET_KEY);

    return data;
  } catch (err) {
    throw ApiError.ErrorAccess("Неверный токен");
  }
};

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, "uploads");
  },
  filename: (_, file, cb) => {
    const splitName = file.originalname.split(".");
    cb(null, `${Date.now()}.${splitName[splitName.length - 1]}`);
  },
});

const upload = multer({ storage });

const processQueryString = (queryString) => {
  const decodedString = decodeURIComponent(queryString);

  const params = new URLSearchParams(decodedString);

  const tgUser = params.get("user");
  const { id: tgId } = JSON.parse(tgUser);

  return tgId || -1;
};

const metricsData = [
  {
    name: "total_users",
    description: "Общее количество пользователей в приложении",
  },
  {
    name: "total_businesses",
    description: "Общее количество бизнесов (мест, отображаемых в приложении)",
  },
  {
    name: "avg_clicks_per_session",
    description: "Среднее количество кликов за один сеанс",
  },
  {
    name: "avg_usage_time",
    description: "Среднее время использования приложения за сеанс",
  },
  {
    name: "new_users_per_month",
    description: "Количество новых пользователей в месяц",
  },
  {
    name: "clicks_by_category_monthly",
    description: "Статистика кликов по категориям (ежемесячно)",
  },
  {
    name: "most_popular_location_year",
    description: "Самая популярная локация года",
  },
  {
    name: "top_search_by_region",
    description: "Топ поисковых запросов по регионам",
  },
  {
    name: "most_active_time_of_day",
    description: "Время суток, когда пользователи наиболее активны",
  },
  {
    name: "filter_usage_count",
    description: "Количество использований каждого фильтра",
  },
  {
    name: "price_filter_popularity",
    description: "Самый популярный ценовой сегмент по категориям",
  },
];

const typeExist = metricsData.map((item) => item.name);

module.exports = {
  generateToken,
  upload,
  verifyToken,
  processQueryString,
  typeExist,
  metricsData,
};
