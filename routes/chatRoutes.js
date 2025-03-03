const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const adminMiddleware = require('../middleware/adminMiddleware');

// Маршруты для пользователей
router.post('/', chatController.createTicket);
router.get('/', chatController.getUserTickets);
router.get('/:id', chatController.getTicket);
router.post('/:id/messages', chatController.addMessage);
router.patch('/:id/read', chatController.markMessagesAsRead);

// Маршруты для администраторов
router.get('/admin/all', adminMiddleware, chatController.getAllTickets);
router.patch('/admin/:id/status', adminMiddleware, chatController.updateTicketStatus);
router.delete('/admin/:id', adminMiddleware, chatController.deleteTicket);

module.exports = router;