const { Router } = require("express");
const placesController = require("../controllers/placesController");
const adminMiddleware = require("../middleware/adminMiddleware");
const tgMiddleware = require("../middleware/tgMiddleware");
const { upload } = require("../utils");

const router = new Router();

router.get("/places", placesController.getItems);
router.post("/places/", adminMiddleware, upload.array('photos', 10), placesController.create);
router.patch("/places/", adminMiddleware, placesController.update);
router.delete("/places/", adminMiddleware, placesController.remove);

router.post(
  "/places/upload",
  adminMiddleware,
  upload.array("photos", 10),
  placesController.upload,
);

// Маршруты для посещенных мест должны идти ДО маршрута с параметром :id
router.post("/places/visited", tgMiddleware, placesController.addVisitedPlace);
router.delete("/places/visited/:id", tgMiddleware, placesController.removeVisitedPlace);
router.get("/places/visited", tgMiddleware, placesController.getVisitedPlaces);

// Маршрут для получения статистики просмотров всех мест
router.get("/places/stats", adminMiddleware, placesController.getPlacesStats);

// Этот маршрут должен быть последним, так как он самый общий
router.get("/places/:id", placesController.getItems);

module.exports = router;
