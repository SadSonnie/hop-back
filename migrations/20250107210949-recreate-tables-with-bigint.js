'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Удаляем существующие таблицы в правильном порядке
    await queryInterface.dropTable('CollectionPlaces');
    await queryInterface.dropTable('Collections');
    await queryInterface.dropTable('Places');

    // Создаем таблицу Places с BIGINT
    await queryInterface.createTable('Places', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      name: {
        type: Sequelize.STRING
      },
      address: {
        type: Sequelize.STRING
      },
      category_id: {
        type: Sequelize.INTEGER
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

    // Создаем таблицу Collections с BIGINT
    await queryInterface.createTable('Collections', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      name: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      user_id: {
        type: Sequelize.INTEGER,
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

    // Создаем таблицу CollectionPlaces с BIGINT для внешних ключей
    await queryInterface.createTable('CollectionPlaces', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      collection_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'Collections',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      place_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'Places',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('CollectionPlaces');
    await queryInterface.dropTable('Collections');
    await queryInterface.dropTable('Places');
  }
};
