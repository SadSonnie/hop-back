'use strict';
module.exports = (sequelize, DataTypes) => {
  const ChatMessage = sequelize.define('ChatMessage', {
    ticketId: DataTypes.BIGINT,
    senderId: DataTypes.BIGINT,
    content: DataTypes.TEXT,
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {});
  
  ChatMessage.associate = function(models) {
    ChatMessage.belongsTo(models.ChatTicket, { foreignKey: 'ticketId' });
    ChatMessage.belongsTo(models.User, { foreignKey: 'senderId' });
  };
  
  return ChatMessage;
};