const ApiError = require("../exceptions/apiError");
const { requestLog } = require("../logger");
const chatService = require('../services/chatService');
const { authService } = require('../services/userServices');

class ChatController {
  async createTicket(req, res, next) {
    try {
      requestLog(req);
      const { userId, username } = req;
      if (!userId) throw ApiError.UnauthorizedError();
      
      // Получаем или создаем пользователя
      const user = await authService(userId, username);
      
      const ticket = await chatService.createTicket(user.tg_id, req.body.subject);
      return res.status(200).json(ticket);
    } catch (error) {
      next(error);
    }
  }

  async getTicket(req, res, next) {
    try {
      requestLog(req);
      const { userId, username } = req;
      if (!userId) throw ApiError.UnauthorizedError();
      
      // Получаем или создаем пользователя
      const user = await authService(userId, username);
      
      const ticket = await chatService.getTicket(req.params.id, user.tg_id);
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }
      return res.status(200).json(ticket);
    } catch (error) {
      next(error);
    }
  }

  async getUserTickets(req, res, next) {
    try {
      requestLog(req);
      const { userId, username } = req;
      if (!userId) throw ApiError.UnauthorizedError();
      
      // Получаем или создаем пользователя
      const user = await authService(userId, username);
      
      const tickets = await chatService.getUserTickets(user.tg_id);
      return res.status(200).json({ items: tickets });
    } catch (error) {
      next(error);
    }
  }

  async getAllTickets(req, res, next) {
    try {
      requestLog(req);
      const tickets = await chatService.getAllTickets(req.query.status);
      return res.status(200).json({ items: tickets });
    } catch (error) {
      next(error);
    }
  }

  async addMessage(req, res, next) {
    try {
      requestLog(req);
      const { userId, username } = req;
      if (!userId) throw ApiError.UnauthorizedError();
      
      // Получаем или создаем пользователя
      const user = await authService(userId, username);
      
      const message = await chatService.addMessage(
        req.params.id,
        user.tg_id,
        req.body.content
      );
      return res.status(200).json(message);
    } catch (error) {
      next(error);
    }
  }

  async updateTicketStatus(req, res, next) {
    try {
      requestLog(req);
      const ticket = await chatService.updateTicketStatus(
        req.params.id,
        req.body.status
      );
      return res.status(200).json(ticket);
    } catch (error) {
      next(error);
    }
  }

  async markMessagesAsRead(req, res, next) {
    try {
      requestLog(req);
      const { userId, username } = req;
      if (!userId) throw ApiError.UnauthorizedError();
      
      // Получаем или создаем пользователя
      const user = await authService(userId, username);
      
      await chatService.markMessagesAsRead(req.params.id, user.tg_id);
      return res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  async deleteTicket(req, res, next) {
    try {
      requestLog(req);
      const { userId } = req;
      if (!userId) throw ApiError.UnauthorizedError();
      
      const result = await chatService.deleteTicket(req.params.id);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ChatController();