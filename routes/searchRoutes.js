const { Router } = require("express");
const searchController = require("../controllers/searchController");
const router = new Router();

router.get("/search", searchController.getItems);

module.exports = router;
