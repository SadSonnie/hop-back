'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Сначала удаляем существующий внешний ключ
    await queryInterface.removeConstraint('Clicks', 'Clicks_place_id_fkey');

    // Добавляем новый внешний ключ с ON DELETE CASCADE
    await queryInterface.addConstraint('Clicks', {
      fields: ['place_id'],
      type: 'foreign key',
      name: 'Clicks_place_id_fkey',
      references: {
        table: 'Places',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // В случае отката удаляем внешний ключ с CASCADE
    await queryInterface.removeConstraint('Clicks', 'Clicks_place_id_fkey');

    // Возвращаем оригинальный внешний ключ без CASCADE
    await queryInterface.addConstraint('Clicks', {
      fields: ['place_id'],
      type: 'foreign key',
      name: 'Clicks_place_id_fkey',
      references: {
        table: 'Places',
        field: 'id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    });
  }
}; 