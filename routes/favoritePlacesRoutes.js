const Router = require('express');
const router = new Router();
const favoritePlacesController = require('../controllers/favoritePlacesController');
const sessionMiddleware = require('../middleware/sessionMiddleware');

router.post('/favorites/:placeId', sessionMiddleware, favoritePlacesController.addToFavorites);
router.delete('/favorites/:placeId', sessionMiddleware, favoritePlacesController.removeFromFavorites);
router.get('/favorites', sessionMiddleware, favoritePlacesController.getFavorites);
router.get('/favorites/:placeId', sessionMiddleware, favoritePlacesController.checkFavorite);

module.exports = router;
