'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Places', 'website', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('Places', 'telegram', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('Places', 'instagram', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('Places', 'vk', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Places', 'website');
    await queryInterface.removeColumn('Places', 'telegram');
    await queryInterface.removeColumn('Places', 'instagram');
    await queryInterface.removeColumn('Places', 'vk');
  }
};
