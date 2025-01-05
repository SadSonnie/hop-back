const { Router } = require("express");
const tagsController = require("../controllers/tagsController");

const adminMiddleware = require("../middleware/adminMiddleware");
const router = new Router();

router.get("/tags", tagsController.getItems);
router.post("/tags", adminMiddleware, tagsController.create);
router.patch("/tags", adminMiddleware, tagsController.update);
router.delete("/tags", adminMiddleware, tagsController.remove);
router.get("/tags/:id", tagsController.getItems);

module.exports = router;
