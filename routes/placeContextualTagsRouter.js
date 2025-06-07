const Router = require('express');
const router = new Router();
const placeContextualTagsController = require('../controllers/placeContextualTagsController');
const tgMiddleware = require('../middleware/tgMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Добавление контекстного тега к месту (только для админов)
router.post(
    '/add',
    tgMiddleware,
    adminMiddleware,
    placeContextualTagsController.addToPlace
);

// Удаление контекстного тега у места (только для админов)
router.delete(
    '/remove',
    tgMiddleware,
    adminMiddleware,
    placeContextualTagsController.removeFromPlace
);

// Получение контекстных тегов места (публичный доступ)
router.get(
    '/by-place/:place_id',
    placeContextualTagsController.getByPlaceId
);

module.exports = router; 