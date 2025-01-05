const { Router } = require("express");
const placesController = require("../controllers/placesController");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = new Router();

router.get("/places", placesController.getItems);
router.get("/places/:id", placesController.getItems);
router.post("/places/", adminMiddleware, placesController.create);
router.patch("/places/", adminMiddleware, placesController.update);
router.delete("/places/", adminMiddleware, placesController.remove);

module.exports = router;
