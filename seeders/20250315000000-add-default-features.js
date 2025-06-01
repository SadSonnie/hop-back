'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const features = [
      { name: "С детьми", createdAt: new Date(), updatedAt: new Date() },
      { name: "Свидание", createdAt: new Date(), updatedAt: new Date() },
      { name: "Бесплатно", createdAt: new Date(), updatedAt: new Date() },
      { name: "Парковка", createdAt: new Date(), updatedAt: new Date() },
      { name: "Wi-Fi", createdAt: new Date(), updatedAt: new Date() },
      { name: "Доставка", createdAt: new Date(), updatedAt: new Date() },
      { name: "Веранда", createdAt: new Date(), updatedAt: new Date() },
      { name: "Панорамный вид", createdAt: new Date(), updatedAt: new Date() },
      { name: "Для больших компаний", createdAt: new Date(), updatedAt: new Date() },
      { name: "Можно с питомцами", createdAt: new Date(), updatedAt: new Date() }
    ];

    await queryInterface.bulkInsert('Features', features, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Features', null, {});
  }
}; 