const Router = require('express');
const router = new Router();
const placeUserPhotosTitleController = require('../controllers/placeUserPhotosTitleController');
const tgMiddleware = require('../middleware/tgMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Установка или обновление заголовка (только для админов)
router.post(
    '/place-user-photos-title/set',
    tgMiddleware,
    adminMiddleware,
    placeUserPhotosTitleController.setTitle
);

// Удаление заголовка (только для админов)
router.delete(
    '/place-user-photos-title/remove',
    tgMiddleware,
    adminMiddleware,
    placeUserPhotosTitleController.removeTitle
);

// Получение заголовка (публичный доступ)
router.get(
    '/place-user-photos-title/:place_id',
    placeUserPhotosTitleController.getTitle
);

module.exports = router; 