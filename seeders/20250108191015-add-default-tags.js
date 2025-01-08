'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tags = [
      { id: 1, name: "С друзьями", createdAt: new Date(), updatedAt: new Date() },
      { id: 2, name: "С животными", createdAt: new Date(), updatedAt: new Date() },
      { id: 3, name: "С партнером", createdAt: new Date(), updatedAt: new Date() },
      { id: 4, name: "С семьей", createdAt: new Date(), updatedAt: new Date() },
      { id: 5, name: "Саморазвитие", createdAt: new Date(), updatedAt: new Date() },
      { id: 6, name: "Одному", createdAt: new Date(), updatedAt: new Date() },
      { id: 7, name: "Шоппинг", createdAt: new Date(), updatedAt: new Date() },
      { id: 8, name: "Для детей", createdAt: new Date(), updatedAt: new Date() },
      { id: 9, name: "Бьюти/спа", createdAt: new Date(), updatedAt: new Date() },
      { id: 10, name: "Еда", createdAt: new Date(), updatedAt: new Date() },
      { id: 11, name: "Развлечения", createdAt: new Date(), updatedAt: new Date() },
      { id: 12, name: "Культура", createdAt: new Date(), updatedAt: new Date() },
      { id: 13, name: "Активный отдых", createdAt: new Date(), updatedAt: new Date() }
    ];

    await queryInterface.bulkInsert('Tags', tags, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Tags', {
      id: {
        [Sequelize.Op.in]: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
      }
    });
  }
};
