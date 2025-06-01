'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PlaceFeatures', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
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
      feature_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Features',
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

    // Добавляем уникальный индекс для предотвращения дублирования связей
    await queryInterface.addIndex('PlaceFeatures', ['place_id', 'feature_id'], {
      unique: true,
      name: 'place_feature_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('PlaceFeatures');
  }
}; 