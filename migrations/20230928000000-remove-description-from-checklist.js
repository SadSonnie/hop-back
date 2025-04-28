'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Проверяем существование таблицы и столбца перед удалением
    try {
      const tableInfo = await queryInterface.describeTable('checklist_items');
      if (tableInfo.description) {
        // Удаляем поле description из таблицы checklist_items
        await queryInterface.removeColumn('checklist_items', 'description');
        console.log('Column description removed successfully');
      } else {
        console.log('Column description does not exist, skipping');
      }
    } catch (error) {
      console.log('Table checklist_items does not exist yet, skipping migration');
    }
  },

  async down(queryInterface, Sequelize) {
    // Если нужно откатить миграцию, добавляем поле description обратно
    try {
      const tableInfo = await queryInterface.describeTable('checklist_items');
      if (!tableInfo.description) {
        await queryInterface.addColumn('checklist_items', 'description', {
          type: Sequelize.TEXT,
          allowNull: true
        });
        console.log('Column description added back successfully');
      } else {
        console.log('Column description already exists, skipping');
      }
    } catch (error) {
      console.log('Table checklist_items does not exist, skipping rollback');
    }
  }
}; 