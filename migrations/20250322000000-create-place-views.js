'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('PlaceViews', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      place_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'Places',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      viewed_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      source: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Индекс для подсчета просмотров по местам
    await queryInterface.addIndex('PlaceViews', ['place_id', 'viewed_at']);
    // Индекс для уникальных просмотров
    await queryInterface.addIndex('PlaceViews', ['place_id', 'user_id', 'viewed_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('PlaceViews');
  }
};