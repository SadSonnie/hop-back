'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Сначала добавляем колонку, разрешая NULL
    await queryInterface.addColumn('Articles', 'content', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    // 2. Обновляем существующие записи, устанавливая пустую строку
    await queryInterface.sequelize.query(`
      UPDATE "Articles" 
      SET content = '' 
      WHERE content IS NULL
    `);

    // 3. Изменяем колонку на NOT NULL
    await queryInterface.changeColumn('Articles', 'content', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Articles', 'content');
  }
};