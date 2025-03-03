const { ChatTicket, ChatMessage, User, ChatUser } = require('../models');
const { Op } = require('sequelize');
const ApiError = require('../exceptions/apiError');

class ChatService {
  async _convertToTgId(data) {
    if (!data) return null;

    // Если это массив, конвертируем каждый элемент
    if (Array.isArray(data)) {
      return Promise.all(data.map(item => this._convertToTgId(item)));
    }

    // Получаем plain object для модификации
    const item = data.toJSON ? data.toJSON() : { ...data };

    // Конвертируем user_id в user_tg_id через таблицу Users
    if (item.user_id) {
      const user = await User.findByPk(item.user_id);
      if (user) {
        item.user_tg_id = user.tg_id;
      }
    }

    // Конвертируем senderId в sender_tg_id для сообщений через таблицу Users
    if ('senderId' in item) {
      const user = await User.findByPk(item.senderId);
      item.sender_tg_id = user ? user.tg_id : null;
    }

    // Рекурсивно конвертируем сообщения в тикетах
    if (item.messages) {
      item.messages = await this._convertToTgId(item.messages);
    }

    return item;
  }

  async createTicket(tgUserId, subject) {
    const chatId = await this.getChatId(tgUserId);
    const ticket = await ChatTicket.create({
      user_id: chatId,
      subject,
      lastMessageAt: new Date()
    });

    // Загружаем тикет со связанными данными
    const fullTicket = await ChatTicket.findByPk(ticket.id, {
      include: [{
        model: ChatMessage,
        as: 'messages',
        include: [{
          model: User,
          attributes: ['id', 'tg_id']
        }]
      }]
    });

    return this._convertToTgId(fullTicket);
  }

  async getTicket(ticketId, tgUserId) {
    const query = {
      where: { id: ticketId },
      include: [{
        model: ChatMessage,
        as: 'messages',
        include: [{
          model: User,
          attributes: ['id', 'tg_id']
        }]
      }, {
        model: User,
        attributes: ['id', 'tg_id']
      }]
    };
  
    const ticket = await ChatTicket.findOne(query);
    return this._convertToTgId(ticket);
  }

  async getUserTickets(tgUserId) {
    const chatId = await this.getChatId(tgUserId);
    const tickets = await ChatTicket.findAll({
      where: { user_id: chatId },
      order: [['lastMessageAt', 'DESC']],
      include: [{
        model: ChatMessage,
        as: 'messages',
        include: [{
          model: User,
          attributes: ['id', 'tg_id']
        }]
      }, {
        model: User,
        attributes: ['id', 'tg_id']
      }]
    });
    return this._convertToTgId(tickets);
  }

  async getAllTickets(status) {
    const query = {
      order: [['lastMessageAt', 'DESC']],
      include: [{
        model: ChatMessage,
        as: 'messages',
        include: [{
          model: User,
          attributes: ['id', 'tg_id']
        }]
      }, {
        model: User,
        attributes: ['id', 'tg_id']
      }]
    };

    if (status) {
      query.where = { status };
    }

    const tickets = await ChatTicket.findAll(query);
    return this._convertToTgId(tickets);
  }

  async addMessage(ticketId, senderTgId, content) {
    // Get the actual User record instead of ChatUser
    const user = await User.findOne({ where: { tg_id: senderTgId }});
    if (!user) {
      throw new Error('User not found');
    }
    
    // Проверяем существование тикета
    const ticket = await ChatTicket.findByPk(ticketId);
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    const message = await ChatMessage.create({
      ticketId,
      senderId: user.id, // Use user.id instead of chat_id
      content
    });

    await ticket.update({ lastMessageAt: new Date() });

    // Загружаем сообщение со связанными данными
    const fullMessage = await ChatMessage.findByPk(message.id, {
      include: [{
        model: User,
        attributes: ['id', 'tg_id']
      }]
    });

    return this._convertToTgId(fullMessage);
  }

  async updateTicketStatus(ticketId, status) {
    const ticket = await ChatTicket.findByPk(ticketId);
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    await ticket.update({
      status,
      closedAt: status === 'closed' ? new Date() : null
    });

    return this._convertToTgId(ticket);
  }

  async markMessagesAsRead(ticketId, tgUserId) {
    const chatId = await this.getChatId(tgUserId);
    return await ChatMessage.update(
      { isRead: true },
      {
        where: {
          ticketId,
          senderId: { [Op.ne]: chatId },
          isRead: false
        }
      }
    );
  }

  async getChatId(tgId) {
    const chatUser = await ChatUser.findOne({ where: { tg_id: tgId } });
    if (!chatUser) {
      const maxChatId = await ChatUser.max('chat_id') || 0;
      const newChatUser = await ChatUser.create({ 
        tg_id: tgId,
        chat_id: maxChatId + 1
      });
      return newChatUser.chat_id;
    }
    return chatUser.chat_id;
  }

  async getTgId(chatId) {
    const chatUser = await ChatUser.findOne({ where: { chat_id: chatId } });
    return chatUser ? chatUser.tg_id : null;
  }

  async deleteTicket(ticketId) {
    const ticket = await ChatTicket.findByPk(ticketId);
    if (!ticket) {
      throw ApiError.NotFoundError('Ticket not found');
    }
    await ChatMessage.destroy({ where: { ticketId } });
    await ticket.destroy();
    return { message: 'Ticket deleted successfully' };
  }
}

module.exports = new ChatService();