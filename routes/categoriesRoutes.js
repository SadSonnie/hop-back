const { Router } = require("express");
const adminMiddleware = require("../middleware/adminMiddleware");
const categoriesController = require("../controllers/categoriesController");

const router = new Router();

router.get("/categories", categoriesController.getItems);
router.post("/categories", adminMiddleware, categoriesController.create);
router.patch("/categories", adminMiddleware, categoriesController.update);
router.delete("/categories", adminMiddleware, categoriesController.remove);
router.get("/categories/:id", categoriesController.getItems);

module.exports = router;
