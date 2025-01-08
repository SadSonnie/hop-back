'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('FeedOrders', { cascade: true });
    await queryInterface.dropTable('CollectionPlaces', { cascade: true });
    await queryInterface.dropTable('Collections', { cascade: true });
    await queryInterface.dropTable('Places', { cascade: true });
  },

  down: async (queryInterface, Sequelize) => {
    // В down не создаем таблицы, так как они будут созданы следующей миграцией
  }
};
