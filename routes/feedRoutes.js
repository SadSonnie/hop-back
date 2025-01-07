const { Router } = require("express");
const feedController = require("../controllers/feedController");

const router = new Router();

router.get("/feed", feedController.getItems);
router.post("/feed", feedController.createItems);
router.patch("/feed", feedController.updateItem);

module.exports = router;
