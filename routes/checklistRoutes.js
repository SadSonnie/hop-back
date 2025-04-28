const { Router } = require("express");
const checklistController = require("../controllers/checklistController");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = new Router();

// Маршруты для администраторов (создание, обновление, удаление)
router.get("/admin/checklist", adminMiddleware, checklistController.getAllChecklistItems);
router.post("/admin/checklist", adminMiddleware, checklistController.createChecklistItem);
router.put("/admin/checklist/:id", adminMiddleware, checklistController.updateChecklistItem);
router.delete("/admin/checklist/:id", adminMiddleware, checklistController.deleteChecklistItem);

// Маршруты для обычных пользователей
router.get("/checklist", checklistController.getUserChecklist);
router.post("/checklist/toggle", checklistController.toggleChecklistItemStatus);

module.exports = router; 