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
  destination: (req, file, cb) => {
    console.log('\n=== DEBUG multer destination START ===');
    console.log('File details:', {
      fieldname: file.fieldname,
      originalname: file.originalname,
      encoding: file.encoding,
      mimetype: file.mimetype,
      size: file.size
    });
    console.log('=== DEBUG multer destination END ===\n');
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    console.log('\n=== DEBUG multer filename START ===');
    console.log('File details:', {
      fieldname: file.fieldname,
      originalname: file.originalname,
      encoding: file.encoding,
      mimetype: file.mimetype,
      size: file.size
    });
    
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    
    // Формат: timestamp-random-originalname.ext
    const filename = `${timestamp}-${randomString}-${file.originalname.replace(/[^a-zA-Z0-9]/g, '_')}`
      .substring(0, 200); // Ограничиваем длину имени файла

    console.log('Generated filename:', filename);
    console.log('=== DEBUG multer filename END ===\n');
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  console.log('\n=== DEBUG multer fileFilter START ===');
  console.log('File details:', {
    fieldname: file.fieldname,
    originalname: file.originalname,
    encoding: file.encoding,
    mimetype: file.mimetype,
    size: file.size
  });
  console.log('Request headers:', req.headers);
  
  // Разрешаем видео для поля hoop_video
  if (file.fieldname === 'hoop_video') {
    if (file.mimetype.startsWith('video/')) {
      console.log('Video file accepted for hoop_video');
      console.log('=== DEBUG multer fileFilter END ===\n');
      cb(null, true);
    } else {
      console.log('Video file rejected - wrong mimetype:', file.mimetype);
      console.log('=== DEBUG multer fileFilter END ===\n');
      cb(new Error('Only videos are allowed for hoop_video!'), false);
    }
  } 
  // Для всех остальных полей разрешаем только изображения
  else if (file.mimetype.startsWith('image/')) {
    console.log('Image file accepted for field:', file.fieldname);
    console.log('=== DEBUG multer fileFilter END ===\n');
    cb(null, true);
  } else {
    console.log('File rejected - not an image:', file.mimetype);
    console.log('=== DEBUG multer fileFilter END ===\n');
    cb(new Error('Only images are allowed!'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    // Временно убираем ограничение на размер файла
    // fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Оборачиваем middleware multer для добавления отладки
const wrappedUpload = (req, res, next) => {
  console.log('\n=== DEBUG multer middleware START ===');
  console.log('Request headers:', req.headers);
  console.log('Content-Length:', req.headers['content-length']);
  
  const uploadFields = upload.fields([
    { name: 'photos', maxCount: 10 },
    { name: 'story_photos', maxCount: 50 },
    { name: 'user_photos', maxCount: 50 },
    { name: 'local_advice_photos', maxCount: 10 },
    { name: 'hoop_video', maxCount: 1 }
  ]);

  uploadFields(req, res, (err) => {
    console.log('\n=== DEBUG multer middleware COMPLETE ===');
    console.log('Error:', err);
    if (err) {
      console.log('Error stack:', err.stack);
      console.log('Error code:', err.code);
      console.log('Error name:', err.name);
    }
    console.log('Files processed:', req.files ? Object.keys(req.files).length : 0);
    if (req.files) {
      Object.entries(req.files).forEach(([field, files]) => {
        console.log(`Field ${field} files:`, files.map(f => ({
          filename: f.filename,
          size: f.size,
          mimetype: f.mimetype
        })));
      });
    }
    console.log('Body fields:', req.body ? Object.keys(req.body) : []);
    console.log('=== DEBUG multer middleware END ===\n');
    
    if (err) {
      return handleMulterError(err, req, res, next);
    }
    next();
  });
};

// Добавляем обработчик ошибок для multer
const handleMulterError = (err, req, res, next) => {
  console.log('\n=== DEBUG multer error handler START ===');
  console.log('Error details:', {
    name: err.name,
    message: err.message,
    code: err.code,
    field: err.field,
    stack: err.stack
  });
  console.log('Request details:', {
    method: req.method,
    path: req.path,
    headers: req.headers
  });
  console.log('=== DEBUG multer error handler END ===\n');

  if (err instanceof multer.MulterError) {
    console.log('MulterError detected:', err.code);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File is too large' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Too many files' });
    }
    return res.status(400).json({ message: err.message });
  }
  next(err);
};

const processQueryString = (queryString) => {
  const decodedString = decodeURIComponent(queryString);
  const params = new URLSearchParams(decodedString);
  const tgUser = params.get("user");
  const userData = JSON.parse(tgUser);
  const { id: tgId, username } = userData;

  return { tgId: tgId || -1, username: username || '' };
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
  handleMulterError,
  wrappedUpload,
};
