'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Пересоздаем таблицу CollectionPlaces
    await queryInterface.dropTable('CollectionPlaces');
    
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
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      place_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'Places',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
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

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('CollectionPlaces');
  }
}; 