'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Добавляем колонку как nullable
    await queryInterface.addColumn('Features', 'category_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'FeatureCategories',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });

    // 2. Обновляем существующие записи, устанавливая category_id = 4 (Удобства)
    await queryInterface.sequelize.query(`
      UPDATE "Features"
      SET category_id = 4
      WHERE category_id IS NULL;
    `);

    // 3. Делаем колонку not null
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