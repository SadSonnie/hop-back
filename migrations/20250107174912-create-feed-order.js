'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('FeedOrders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      itemId: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      itemType: {
        type: Sequelize.STRING,
        allowNull: false
      },
      order: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.addIndex('FeedOrders', ['itemId', 'itemType'], {
      unique: true,
      name: 'feed_orders_item_unique'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('FeedOrders');
  }
};
