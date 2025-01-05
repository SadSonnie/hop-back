const { Router } = require("express");
const adminMiddleware = require("../middleware/adminMiddleware");
const metricsController = require("../controllers/metricsController");

const router = new Router();

router.get(
  "/metrics",
  adminMiddleware,
  metricsController.getItems,
);
router.get(
  "/metrics/:id",
  adminMiddleware,
  metricsController.getItems,
);
router.patch(
  "/metrics/",
  adminMiddleware,
  metricsController.update,
);
router.post(
  "/metrics/",
  adminMiddleware,
  metricsController.create,
);



router.delete(
  "/metrics/",
  adminMiddleware,
  metricsController.remove,
);



router.post(
  "/metrics/generate",
  adminMiddleware,
  metricsController.generate,
);

// Metrics data

router.get(
  "/metrics-data",
  adminMiddleware,
  metricsController.formData
)

module.exports = router;
