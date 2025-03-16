'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const metric = await queryInterface.bulkInsert('Metrics', [{
      metric_name: 'total_users',
      description: 'Общее количество пользователей в приложении',
      createdAt: new Date(),
      updatedAt: new Date()
    }], { returning: true });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Metrics', { metric_name: 'total_users' });
  }
};