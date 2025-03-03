'use strict';
module.exports = (sequelize, DataTypes) => {
  const ChatTicket = sequelize.define('ChatTicket', {
    user_id: DataTypes.BIGINT,
    status: {
      type: DataTypes.ENUM('open', 'in_progress', 'closed', 'resolved'),
      defaultValue: 'open'
    },
    subject: DataTypes.STRING,
    lastMessageAt: DataTypes.DATE,
    closedAt: DataTypes.DATE
  }, {});
  
  ChatTicket.associate = function(models) {
    ChatTicket.belongsTo(models.User, { foreignKey: 'user_id' });
    ChatTicket.hasMany(models.ChatMessage, { 
      foreignKey: 'ticketId',
      as: 'messages'
    });
  };
  
  return ChatTicket;
};