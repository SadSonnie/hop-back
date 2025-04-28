'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Создаем таблицу для пунктов чек-листа
    await queryInterface.createTable('checklist_items', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Создаем таблицу для хранения статусов выполнения пользователями
    await queryInterface.createTable('user_checklist_statuses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      checklist_item_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'checklist_items',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      completed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      completed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Добавляем индексы для быстрого поиска
    await queryInterface.addIndex('user_checklist_statuses', ['user_id']);
    await queryInterface.addIndex('user_checklist_statuses', ['checklist_item_id']);
    await queryInterface.addIndex('user_checklist_statuses', ['user_id', 'checklist_item_id'], {
      unique: true,
      name: 'unique_user_checklist_item'
    });
  },

  async down(queryInterface, Sequelize) {
    // Удаляем таблицы в обратном порядке
    await queryInterface.dropTable('user_checklist_statuses');
    await queryInterface.dropTable('checklist_items');
  }
}; 