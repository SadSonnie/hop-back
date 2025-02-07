const favoritePlacesService = require('../services/favoritePlacesService');

class FavoritePlacesController {
  async addToFavorites(req, res) {
    try {
      const { userId } = req;
      const { placeId } = req.params;
      const result = await favoritePlacesService.addToFavorites(userId, placeId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async removeFromFavorites(req, res) {
    try {
      const { userId } = req;
      const { placeId } = req.params;
      const result = await favoritePlacesService.removeFromFavorites(userId, placeId);
      res.json({ success: result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getFavorites(req, res) {
    try {
      const { userId } = req;
      const favorites = await favoritePlacesService.getFavorites(userId);
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async checkFavorite(req, res) {
    try {
      const { userId } = req;
      const { placeId } = req.params;
      const isFavorite = await favoritePlacesService.isFavorite(userId, placeId);
      res.json({ isFavorite });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new FavoritePlacesController();
