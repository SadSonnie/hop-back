const { Router } = require("express");
const moderationController = require("../controllers/moderationController");

const router = new Router();

router.get("/moderation", moderationController.getItems);
router.get("/moderation/:id", moderationController.getItems);

module.exports = router;
