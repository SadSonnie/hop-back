const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const adminMiddleware = require('../middleware/adminMiddleware');
const multer = require('multer');
const path = require('path');

// Настройка multer для загрузки фотографий
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/reviews/') // Убедитесь, что эта директория существует
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    files: 5, // Максимум 5 файлов
    fileSize: 5 * 1024 * 1024 // 5 MB
  },
  fileFilter: (req, file, cb) => {
    // Проверяем тип файла
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

// Маршруты для пользователей
router.post('/reviews', upload.array('photos', 5), reviewController.create);
router.get('/reviews/my', reviewController.getUserReviews);
router.get('/places/:place_id/reviews', reviewController.getPlaceReviews);

// Маршруты для модераторов
router.get('/admin/reviews/pending', 
  adminMiddleware, 
  reviewController.getPendingReviews
);

router.put('/admin/reviews/:id', 
  adminMiddleware, 
  reviewController.moderateReview
);

router.delete('/admin/reviews/:id', 
  adminMiddleware, 
  reviewController.deleteReview
);

module.exports = router;
