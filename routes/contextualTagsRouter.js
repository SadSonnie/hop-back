const Router = require('express');
const router = new Router();
const contextualTagsController = require('../controllers/contextualTagsController');
const tgMiddleware = require('../middleware/tgMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Создание контекстного тега (только для админов)
router.post(
    '/create',
    tgMiddleware,
    adminMiddleware,
    contextualTagsController.create
);

// Удаление контекстного тега (только для админов)
router.delete(
    '/remove',
    tgMiddleware,
    adminMiddleware,
    contextualTagsController.remove
);

// Получение контекстных тегов по ID основного тега
router.get(
    '/by-tag/:parent_tag_id',
    contextualTagsController.getByParentId
);

module.exports = router; 