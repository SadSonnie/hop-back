const { Router } = require('express');
const clickController = require('../controllers/clickController');
const tgMiddleware = require('../middleware/tgMiddleware');

const router = new Router();

// Публичный эндпоинт для записи кликов
router.post('/clicks', clickController.recordClick);

// Защищенные эндпоинты для получения статистики
router.get('/clicks/stats', tgMiddleware, clickController.getClickStats);
router.get('/clicks/timeseries', tgMiddleware, clickController.getClicksTimeSeries);

module.exports = router; 