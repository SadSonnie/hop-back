const Router = require('express').Router;
const router = new Router();
const articleController = require('../controllers/articleController');
const { upload } = require('../utils');

// Публичные маршруты
router.get('/', articleController.getAll.bind(articleController));
router.get('/:id', articleController.getById.bind(articleController));

// Защищенные маршруты (только для админов)
router.post('/',
  upload.fields([
    { name: 'photos', maxCount: 10 } // Разрешаем загрузку до 10 фото
  ]),
  articleController.create.bind(articleController)
);

router.put('/:id',
  upload.fields([
    { name: 'photos', maxCount: 10 }
  ]),
  articleController.update.bind(articleController)
);

router.delete('/:id',
  articleController.delete.bind(articleController)
);

module.exports = router;