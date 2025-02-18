const { requiredField } = require("../errorMessages");
const { requestLog } = require("../logger");

const {
  createPlaceService,
  updatePlaceService,
  getItemPlaceService,
  getItemsPlaceService,
  removePlaceService,
  addPicturePlace,
} = require("../services/placesService");
const { VisitedPlaces, Places, Users } = require("../models");

class PlacesController {
  async getItems(req, res, next) {
    try {
      requestLog(req);
      const { id } = req.params;
      const { offset, limit, showAll } = req.query;

      let response;

      if (id) {
        response = await getItemPlaceService({ id });
      } else {
        response = await getItemsPlaceService({ offset, limit, showAll: showAll === 'true' });
      }

      return res.status(200).json(!id ? { items: response } : { ...response });
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      requestLog(req);
      const { 
        name, 
        address, 
        collection_ids, 
        tags_ids, 
        category_id,
        description,
        isPremium,
        priceLevel,
        coordinates,
        phone,
        status
      } = req.body;

      if (!name) requiredField("name");
      if (!address) requiredField("address");
      if (!category_id) requiredField("category_id");

      // Парсим JSON строки в массивы и объекты
      const parsedTags = tags_ids ? JSON.parse(tags_ids) : [];
      const parsedCollections = collection_ids ? JSON.parse(collection_ids) : [];
      const parsedCoordinates = coordinates ? JSON.parse(coordinates) : undefined;

      const response = await createPlaceService({
        name,
        collectionIds: parsedCollections,
        tagsIds: parsedTags,
        address,
        categoryId: category_id,
        description,
        isPremium: isPremium === 'true',
        priceLevel: Number(priceLevel),
        coordinates: parsedCoordinates,
        phone,
        photos: req.files || [],
        isAdmin: req.user && req.user.role === 'ADMIN',
        status
      });

      return res.status(200).json({ ...response });
    } catch (e) {
      next(e);
    }
  }

  async remove(req, res, next) {
    try {
      requestLog(req);
      const { id } = req.body;
      if (!id) requiredField("id");

      await removePlaceService(id);

      return res.status(200).json({});
    } catch (e) {
      next(e);
    }
  }

  async upload(req, res, next) {
    try {
      const { id } = req.body;
      const files = req.files;

      if (!id) requiredField("id");
      if (!files || !files.length) requiredField("photos");

      const response = await addPicturePlace({ 
        id, 
        // Сохраняем только имя файла, без пути uploads/
        files: files.map(file => file.filename)
      });
      return res.status(200).json({ ...response });
    } catch (e) {
      next(e);
    }
  }

  async update(req, res, next) {
    try {
      requestLog(req);
      const { id } = req.body;
      if (!id) requiredField("id");

      const response = await updatePlaceService({ ...req.body, id: Number(id) });

      return res.status(200).json({ ...response });
    } catch (e) {
      next(e);
    }
  }

  async addVisitedPlace(req, res, next) {
    try {
      requestLog(req);
      const { place_id } = req.body;
      const tg_id = parseInt(req.userId); // Преобразуем в число

      // Находим пользователя по Telegram ID
      const user = await Users.findOne({ where: { tg_id } });
      if (!user) {
        return res.status(404).json({ message: 'Пользователь не найден' });
      }

      const visited = await VisitedPlaces.create({
        user_id: user.id, // Используем внутренний ID пользователя
        place_id,
        visited_at: new Date()
      });

      return res.status(201).json(visited);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ message: 'Это место уже отмечено как посещенное' });
      }
      next(error);
    }
  }

  async removeVisitedPlace(req, res, next) {
    try {
      requestLog(req);
      const place_id = req.params.id; // This is the place_id from the URL
      const tg_id = parseInt(req.userId);

      // Находим пользователя по Telegram ID
      const user = await Users.findOne({ where: { tg_id } });
      if (!user) {
        return res.status(404).json({ message: 'Пользователь не найден' });
      }

      const deleted = await VisitedPlaces.destroy({
        where: { place_id, user_id: user.id }
      });

      if (!deleted) {
        return res.status(404).json({ message: 'Запись не найдена' });
      }

      return res.status(200).json({ message: 'Запись успешно удалена' });
    } catch (error) {
      next(error);
    }
  }

  async getVisitedPlaces(req, res, next) {
    try {
      requestLog(req);
      const tg_id = parseInt(req.userId); // Преобразуем в число
      const { limit = 10, offset = 0 } = req.query;

      // Находим пользователя по Telegram ID
      const user = await Users.findOne({ where: { tg_id } });
      if (!user) {
        return res.status(404).json({ message: 'Пользователь не найден' });
      }

      const visited = await VisitedPlaces.findAndCountAll({
        where: { user_id: user.id },
        include: [{
          model: Places,
          attributes: ['name', 'address', 'latitude', 'longitude']
        }],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['visited_at', 'DESC']]
      });

      return res.status(200).json(visited);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PlacesController();
