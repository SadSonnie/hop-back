'use strict';
module.exports = (sequelize, DataTypes) => {
  const ChatUser = sequelize.define('ChatUser', {
    tg_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    chat_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    }
  }, {});
  
  ChatUser.associate = function(models) {
    // Можем добавить ассоциации если потребуется
  };
  
  return ChatUser;
};