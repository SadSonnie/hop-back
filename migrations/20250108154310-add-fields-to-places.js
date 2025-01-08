'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Places', 'description', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    await queryInterface.addColumn('Places', 'isPremium', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });

    await queryInterface.addColumn('Places', 'priceLevel', {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    await queryInterface.addColumn('Places', 'latitude', {
      type: Sequelize.DECIMAL(10, 8),
      allowNull: true
    });

    await queryInterface.addColumn('Places', 'longitude', {
      type: Sequelize.DECIMAL(11, 8),
      allowNull: true
    });

    await queryInterface.addColumn('Places', 'phone', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Places', 'description');
    await queryInterface.removeColumn('Places', 'isPremium');
    await queryInterface.removeColumn('Places', 'priceLevel');
    await queryInterface.removeColumn('Places', 'latitude');
    await queryInterface.removeColumn('Places', 'longitude');
    await queryInterface.removeColumn('Places', 'phone');
  }
};
