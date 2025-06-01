'use strict';

const { Router } = require('express');
const adminMiddleware = require('../middleware/adminMiddleware');
const featureController = require('../controllers/featureController');

const router = new Router();

// Создание и удаление фич (только для админов)
router.post('/', adminMiddleware, featureController.create);
router.delete('/', adminMiddleware, featureController.remove);

// Добавление и удаление фичи у места (только админ)
router.post('/places', adminMiddleware, featureController.addToPlace);
router.delete('/places', adminMiddleware, featureController.removeFromPlace);

// Получение фич места (все пользователи)
router.get('/places/:id', featureController.getPlaceFeatures);

// Получение всех категорий фич (все пользователи)
router.get('/categories', featureController.getCategories);

// Получение всех фич (все пользователи)
router.get('/', featureController.getAll);

module.exports = router; 