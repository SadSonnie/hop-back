'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Создаем таблицу категорий
    await queryInterface.createTable('FeatureCategories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Добавляем базовые категории
    await queryInterface.bulkInsert('FeatureCategories', [
      {
        id: 1,
        name: 'Метро',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        name: 'Вайб',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        name: 'Компания',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 4,
        name: 'Удобства',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // Добавляем колонку category_id в таблицу Features, пока что с null
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

    // По умолчанию присваиваем все существующие фичи к категории "Удобства"
    await queryInterface.sequelize.query(`
      UPDATE "Features"
      SET category_id = 4
      WHERE category_id IS NULL;
    `);

    // Теперь делаем колонку not null
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
    // Удаляем колонку category_id из таблицы Features
    await queryInterface.removeColumn('Features', 'category_id');
    
    // Удаляем таблицу категорий
    await queryInterface.dropTable('FeatureCategories');
  }
}; 