const { Router } = require("express");
const proposalsController = require("../controllers/proposalsContoller");

const router = new Router();

router.post("/proposals", proposalsController.create);
router.patch("/proposals", proposalsController.update);
router.delete("/proposals", proposalsController.remove);
router.get("/proposals", proposalsController.getItems);
router.get("/proposals/:id", proposalsController.getItems);

module.exports = router;
