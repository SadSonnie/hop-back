const { Router } = require("express");
const placesController = require("../controllers/placesController");
const adminMiddleware = require("../middleware/adminMiddleware");
const tgMiddleware = require("../middleware/tgMiddleware");
const { upload } = require("../utils");

const router = new Router();

// Маршруты для посещенных мест
router.post("/places/visited", tgMiddleware, placesController.addVisitedPlace);
router.delete("/places/visited/:id", tgMiddleware, placesController.removeVisitedPlace);
router.get("/places/visited", tgMiddleware, placesController.getVisitedPlaces);

// Маршрут для получения статистики просмотров всех мест
router.get("/places/stats", adminMiddleware, placesController.getPlacesStats);

// Маршрут для получения данных для графика просмотров
router.get("/places/stats/time-series", adminMiddleware, placesController.getPlacesViewsTimeSeries);

// Общие маршруты для мест
router.get("/places", placesController.getItems);
router.get("/places/:id", placesController.getItems);

// Создание места с множественными файлами
router.post("/places/", 
  adminMiddleware, 
  upload.fields([
    { name: 'photos', maxCount: 10 },
    { name: 'story_photos', maxCount: 50 },
    { name: 'user_photos', maxCount: 50 },
    { name: 'local_advice_photos', maxCount: 10 },
    { name: 'hoop_video', maxCount: 1 }
  ]), 
  placesController.create
);

// Обновление места с множественными файлами
router.put("/places/:id",
  adminMiddleware,
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

// Удаление места
router.delete("/places/:id", adminMiddleware, placesController.remove);

module.exports = router;
