'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Добавляем колонку category_id
    await queryInterface.addColumn('Features', 'category_id', {
      type: Sequelize.INTEGER,
      allowNull: true, // Сначала разрешаем null
      references: {
        model: 'FeatureCategories',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });

    // По умолчанию присваиваем все существующие фичи к категории "Удобства" (id: 4)
    await queryInterface.sequelize.query(`
      UPDATE "Features"
      SET category_id = 4
      WHERE category_id IS NULL;
    `);

    // Делаем колонку not null
    await queryInterface.changeColumn('Features', 'category_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'FeatureCategories',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Features', 'category_id');
  }
}; 