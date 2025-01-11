'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PlacePhotos', {
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
        onDelete: 'CASCADE'
      },
      photo_url: {
        type: Sequelize.STRING,
        allowNull: false
      },
      is_main: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
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
    await queryInterface.dropTable('PlacePhotos');
  }
};
