const { requiredField } = require("../errorMessages");
const { requestLog } = require("../logger");
const PlaceViewService = require('../services/placeViewService');

const {
  createPlaceService,
  updatePlaceService,
  getItemPlaceService,
  getItemsPlaceService,
  removePlaceService,
  addPicturePlace,
  setPlaceAvatar
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
        // Записываем просмотр места
        await PlaceViewService.addView(
          id,
          req.user?.id,
          req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'web'
        );
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
        status,
        website,
        telegram,
        instagram,
        vk,
        local_advice,
        user_photos
      } = req.body;

      const files = req.files || {};
      
      if (!name) requiredField("name");
      if (!address) requiredField("address");
      if (!category_id) requiredField("category_id");

      const parseJsonField = (field) => {
        if (!field) return null;
        if (typeof field === 'object') return field;
        try {
          return JSON.parse(field);
        } catch {
          return field;
        }
      };

      const parsedLocalAdvice = parseJsonField(local_advice);
      const parsedCoordinates = parseJsonField(coordinates);
      const parsedTags = parseJsonField(tags_ids) || [];
      const parsedCollections = parseJsonField(collection_ids) || [];
      const parsedUserPhotos = parseJsonField(user_photos) || [];

      // Обработка загруженных файлов
      const photos = files.photos || [];
      const storyPhotos = files.story_photos || [];
      const userPhotoFiles = files.user_photos || [];
      const hoopVideo = files.hoop_video?.[0];

      // Сопоставляем загруженные пользовательские фото с их данными
      const processedUserPhotos = userPhotoFiles.map((photo, index) => {
        const metadata = parsedUserPhotos[index] || {};
        return {
          photo,
          author_name: metadata.author_name || 'Unknown',
          caption: metadata.caption || '',
          link: metadata.link || '',
          date: metadata.date || new Date()
        };
      });

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
        photos,
        storyPhotos,
        localAdvice: parsedLocalAdvice,
        userPhotos: processedUserPhotos,
        hoopVideo,
        isAdmin: req.user && req.user.role === 'ADMIN',
        status,
        website,
        telegram,
        instagram,
        vk
      });

      return res.status(200).json({ ...response });
    } catch (e) {
      next(e);
    }
  }

  async remove(req, res, next) {
    try {
      requestLog(req);
      const id = req.params.id;
      if (!id) requiredField("id");

      await removePlaceService(id);

      return res.status(200).json({ message: "Place successfully deleted" });
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
      console.log('=== DEBUG UPDATE REQUEST START ===');
      console.log('Headers:', req.headers);
      console.log('Content-Type:', req.get('Content-Type'));
      console.log('Body:', req.body);
      console.log('=== FORM FIELDS ===');
      console.log('Raw body keys:', Object.keys(req.body));
      console.log('Files object:', req.files);
      console.log('File fields:', req.files ? Object.keys(req.files) : []);

      if (req.files?.story_photos) {
        console.log('Files in story_photos:', req.files.story_photos.map(file => ({
          fieldname: file.fieldname,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size
        })));
      }

      if (req.files?.user_photos) {
        console.log('Files in user_photos:', req.files.user_photos.map(file => ({
          fieldname: file.fieldname,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size
        })));
      }
      console.log('=== DEBUG UPDATE REQUEST END ===');

      const data = await updatePlaceService({
        id: req.params.id,
        body: req.body,
        name: req.body.name,
        address: req.body.address,
        categoryId: req.body.category_id,
        description: req.body.description,
        isPremium: req.body.isPremium === 'true',
        priceLevel: Number(req.body.priceLevel),
        coordinates: req.body.coordinates ? JSON.parse(req.body.coordinates) : null,
        phone: req.body.phone,
        files: req.files,
        status: req.body.status,
        website: req.body.website,
        telegram: req.body.telegram,
        instagram: req.body.instagram,
        vk: req.body.vk,
        isAdmin: true,
        avatar_url: req.body.avatar_url,
        localAdvice: req.body.local_advice ? JSON.parse(req.body.local_advice) : null,
        userPhotos: req.body.user_photos_metadata ? JSON.parse(req.body.user_photos_metadata).map((metadata, index) => ({
          ...metadata,
          photo: req.files?.user_photos?.[index]
        })) : [],
        tagsIds: req.body.tags_ids ? (Array.isArray(req.body.tags_ids) ? req.body.tags_ids : [req.body.tags_ids]) : []
      });

      res.json(data);
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

  // Получить статистику просмотров для всех мест
  async getPlacesStats(req, res, next) {
    try {
      requestLog(req);
      
      const stats = await PlaceViewService.getFullStats();
      
      return res.status(200).json({
        items: stats
      });
    } catch (err) {
      next(err);
    }
  }
  
  // Получить статистику просмотров по временной шкале для графика
  async getPlacesViewsTimeSeries(req, res, next) {
    try {
      requestLog(req);
      
      const { interval = 'day', place_id } = req.query;
      // Определяем, был ли передан параметр days
      const daysWasProvided = 'days' in req.query;
      const parsedDays = daysWasProvided ? parseInt(req.query.days) : null;
      
      const timeSeriesData = await PlaceViewService.getViewsTimeSeries(
        parsedDays, 
        interval, 
        place_id ? parseInt(place_id) : null
      );
      
      return res.status(200).json({
        data: timeSeriesData,
        meta: {
          days: parsedDays,
          interval,
          place_id: place_id ? parseInt(place_id) : null,
          all_time: !daysWasProvided
        }
      });
    } catch (err) {
      next(err);
    }
  }

  // Загрузить аватарку места
  async uploadAvatar(req, res, next) {
    try {
      requestLog(req);
      const { id } = req.body;
      const file = req.file;

      if (!id) requiredField("id");
      if (!file) requiredField("avatar");

      const response = await setPlaceAvatar({ 
        id, 
        file
      });
      
      return res.status(200).json({ ...response });
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new PlacesController();
