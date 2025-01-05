const { Router } = require("express");
const feedController = require("../controllers/feedController");

const router = new Router();

router.get("/feed", feedController.getItems);

module.exports = router;
