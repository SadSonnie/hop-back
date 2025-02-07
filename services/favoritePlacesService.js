const { FavoritePlaces, Places, Users } = require('../models');

class FavoritePlacesService {
  async addToFavorites(tgId, placeId) {
    try {
      const user = await Users.findOne({ where: { tg_id: tgId } });
      if (!user) {
        throw new Error('User not found');
      }
      
      const [favorite, created] = await FavoritePlaces.findOrCreate({
        where: { user_id: user.id, place_id: placeId }
      });
      return { favorite, created };
    } catch (error) {
      throw error;
    }
  }

  async removeFromFavorites(tgId, placeId) {
    try {
      const user = await Users.findOne({ where: { tg_id: tgId } });
      if (!user) {
        throw new Error('User not found');
      }

      const result = await FavoritePlaces.destroy({
        where: { user_id: user.id, place_id: placeId }
      });
      return result > 0;
    } catch (error) {
      throw error;
    }
  }

  async getFavorites(tgId) {
    try {
      const user = await Users.findOne({ where: { tg_id: tgId } });
      if (!user) {
        throw new Error('User not found');
      }

      const favorites = await Places.findAll({
        include: [{
          model: Users,
          as: 'favoritedBy',
          where: { id: user.id },
          through: { attributes: [] }
        }]
      });
      return favorites;
    } catch (error) {
      throw error;
    }
  }

  async isFavorite(tgId, placeId) {
    try {
      const user = await Users.findOne({ where: { tg_id: tgId } });
      if (!user) {
        throw new Error('User not found');
      }

      const favorite = await FavoritePlaces.findOne({
        where: { user_id: user.id, place_id: placeId }
      });
      return !!favorite;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new FavoritePlacesService();
