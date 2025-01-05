const { Router } = require("express");
const adminMiddleware = require("../middleware/adminMiddleware");
const collectionController = require("../controllers/collectionController");

const router = new Router();

router.post(
  "/collections",
  adminMiddleware,
  collectionController.create,
);
router.patch(
  "/collections",
  adminMiddleware,
  collectionController.update,
);
router.delete(
  "/collections",
  adminMiddleware,
  collectionController.remove,
);
router.get("/collections", collectionController.getItems);
router.get("/collections/:id", collectionController.getItems);

module.exports = router;
