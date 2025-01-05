const { Router } = require("express");
const adminMiddleware = require("../middleware/adminMiddleware");
const filtersController = require("../controllers/filtersController");

const router = new Router();

router.post("/filters", adminMiddleware, filtersController.create);
router.patch("/filters", adminMiddleware, filtersController.update);
router.delete("/filters", adminMiddleware, filtersController.remove);
router.get("/filters", filtersController.getItems);
router.get("/filters/:id", filtersController.getItems);

module.exports = router;
