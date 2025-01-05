const { Router } = require("express");
const profileController = require("../controllers/profileController")
const tgMiddleware = require('../middleware/tgMiddleware')
const adminMiddleware = require('../middleware/adminMiddleware')

const router = new Router();

router.get("/profile", profileController.get);
router.post("/profile/visits",adminMiddleware, profileController.create);

module.exports = router;
