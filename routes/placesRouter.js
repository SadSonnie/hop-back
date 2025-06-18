const { Router } = require("express");
const placesController = require("../controllers/placesController");
const adminMiddleware = require("../middleware/adminMiddleware");
const tgMiddleware = require("../middleware/tgMiddleware");
const { wrappedUpload, upload } = require("../utils");
const express = require('express');

const router = new Router();

// Маршруты для посещенных мест (должны быть первыми, так как более специфичные)
router.post("/places/visited", tgMiddleware, placesController.addVisitedPlace);
router.delete("/places/visited/:id", tgMiddleware, placesController.removeVisitedPlace);
router.get("/places/visited", tgMiddleware, placesController.getVisitedPlaces);

// Маршрут для получения статистики просмотров всех мест
router.get("/places/stats", adminMiddleware, placesController.getPlacesStats);

// Маршрут для получения временного ряда просмотров
router.get("/places/views/timeseries", placesController.getPlacesViewsTimeSeries);

// Обновление фотографий места
router.post(
  "/places/upload",
  adminMiddleware,
  upload.array("photos", 10),
  placesController.upload
);

// Загрузка аватарки места
router.post(
  "/places/avatar",
  adminMiddleware,
  upload.single("avatar"),
  placesController.uploadAvatar
);

// Общие маршруты для мест (должны быть после специфичных)
router.get("/places", placesController.getItems);
router.get("/places/:id", placesController.getItems);

// Определяем поля для загрузки файлов
const uploadFields = [
  { name: 'avatar', maxCount: 1 },
  { name: 'photos', maxCount: 10 },
  { name: 'story_photos', maxCount: 10 },
  { name: 'user_photos', maxCount: 10 },
  { name: 'local_advice_photo', maxCount: 10 },
  { name: 'hoop_video', maxCount: 1 }
];

router.post('/places',
  adminMiddleware,
  (req, res, next) => {
    console.log('\n=== POST /places request received ===');
    console.log('Headers:', req.headers);
    console.log('Content-Length:', req.headers['content-length']);
    if (req.files) {
      Object.entries(req.files).forEach(([field, files]) => {
        console.log(`\nFiles in ${field}:`);
        files.forEach(file => {
          console.log('File:', {
            fieldname: file.fieldname,
            originalname: file.originalname,
            size: file.size,
            mimetype: file.mimetype
          });
        });
      });
    }
    next();
  },
  upload.fields(uploadFields),
  placesController.create
);

// Обновление места с множественными файлами
router.put("/places/:id",
  (req, res, next) => {
    console.log('\n=== PUT /places/:id request received ===');
    console.log('Headers:', req.headers);
    console.log('Content-Length:', req.headers['content-length']);
    if (req.files) {
      Object.entries(req.files).forEach(([field, files]) => {
        console.log(`\nFiles in ${field}:`);
        files.forEach(file => {
          console.log('File:', {
            fieldname: file.fieldname,
            originalname: file.originalname,
            size: file.size,
            mimetype: file.mimetype
          });
        });
      });
    }
    next();
  },
  upload.fields([
    { name: 'photos', maxCount: 10 },
    { name: 'story_photos', maxCount: 50 },
    { name: 'user_photos', maxCount: 50 },
    { name: 'local_advice_photo', maxCount: 10 },
    { name: 'hoop_video', maxCount: 1 },
    { name: 'avatar', maxCount: 1 }
  ]),
  placesController.update
);

// Удаление места
router.delete("/places/:id", adminMiddleware, placesController.remove);

module.exports = router;
