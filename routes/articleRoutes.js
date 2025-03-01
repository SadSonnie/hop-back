const Router = require('express').Router;
const router = new Router();
const articleController = require('../controllers/articleController');
const adminMiddleware = require('../middleware/adminMiddleware');
const { upload } = require('../utils');

// Публичные маршруты
router.get('/', articleController.getAll.bind(articleController));
router.get('/:id', articleController.getById.bind(articleController));

// Защищенные маршруты (только для админов)
router.post('/',
  adminMiddleware,
  upload.single('photo'),
  articleController.create.bind(articleController)
);

router.put('/:id',
  adminMiddleware,
  upload.single('photo'),
  articleController.update.bind(articleController)
);

router.delete('/:id',
  adminMiddleware,
  articleController.delete.bind(articleController)
);

module.exports = router;