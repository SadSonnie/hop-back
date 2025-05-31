'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('LocalAdvicePhotos', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER,
        autoIncrement: true
      },
      local_advice_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'LocalAdvice',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      photo_url: {
        type: Sequelize.STRING,
        allowNull: false
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

    // Добавляем индекс для ускорения поиска по local_advice_id
    await queryInterface.addIndex('LocalAdvicePhotos', ['local_advice_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('LocalAdvicePhotos');
  }
};
