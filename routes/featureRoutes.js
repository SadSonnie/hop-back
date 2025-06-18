'use strict';

const { Router } = require('express');
const adminMiddleware = require('../middleware/adminMiddleware');
const tgMiddleware = require('../middleware/tgMiddleware');
const featureController = require('../controllers/featureController');

const router = new Router();

console.error('\x1b[31m%s\x1b[0m', '!!! [Router] Registering feature routes !!!');

// Добавляем middleware для всех маршрутов в этом роутере
router.use((req, res, next) => {
    console.error('\x1b[31m%s\x1b[0m', '!!! [Router] Feature router middleware !!!');
    console.error('Original URL:', req.originalUrl);
    console.error('Base URL:', req.baseUrl);
    console.error('Path:', req.path);
    
    // Если путь начинается с /features, обрабатываем его здесь
    if (req.path.startsWith('/features')) {
        next();
    } else {
        // Иначе пропускаем этот роутер
        next('route');
    }
});

// Создание и удаление фич (только для админов)
router.post('/features', tgMiddleware, adminMiddleware, featureController.create);
router.delete('/features', tgMiddleware, adminMiddleware, featureController.remove);

// Добавление и удаление фичи у места (только админ)
router.post('/features/places', tgMiddleware, adminMiddleware, featureController.addToPlace);
router.delete('/features/places', tgMiddleware, adminMiddleware, featureController.removeFromPlace);

// Получение фич места (все пользователи)
router.get('/features/places/:id', featureController.getPlaceFeatures);

// Получение всех категорий фич (все пользователи)
router.get('/features/categories', featureController.getCategories);

// Получение всех фич (все пользователи)
router.get('/features', (req, res, next) => {
    console.error('\x1b[31m%s\x1b[0m', '!!! [Router] GET /features handler !!!');
    console.error('Original URL:', req.originalUrl);
    console.error('Base URL:', req.baseUrl);
    console.error('Path:', req.path);
    return featureController.getAll(req, res, next);
});

console.error('\x1b[31m%s\x1b[0m', '!!! [Router] Feature routes registered !!!');

module.exports = router; 