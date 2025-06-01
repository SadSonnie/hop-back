'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Сначала удаляем связи с тегами, которые будут удалены
    await queryInterface.bulkDelete('PlaceTags', {
      tag_id: {
        [Sequelize.Op.in]: [1, 2, 3, 4] // "С друзьями", "С животными", "С партнером", "С семьей"
      }
    });

    // Теперь удаляем сами теги
    await queryInterface.bulkDelete('Tags', {
      id: {
        [Sequelize.Op.in]: [1, 2, 3, 4]
      }
    });

    // Переименовываем тег "Одному" в "Люди"
    await queryInterface.bulkUpdate('Tags', 
      { name: "Люди" },
      { id: 6 }
    );
  },

  async down(queryInterface, Sequelize) {
    // Восстанавливаем удаленные теги
    const deletedTags = [
      { id: 1, name: "С друзьями", createdAt: new Date(), updatedAt: new Date() },
      { id: 2, name: "С животными", createdAt: new Date(), updatedAt: new Date() },
      { id: 3, name: "С партнером", createdAt: new Date(), updatedAt: new Date() },
      { id: 4, name: "С семьей", createdAt: new Date(), updatedAt: new Date() }
    ];
    await queryInterface.bulkInsert('Tags', deletedTags, {});

    // Возвращаем старое название тега
    await queryInterface.bulkUpdate('Tags',
      { name: "Одному" },
      { id: 6 }
    );
  }
}; 