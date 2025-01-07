'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Изменяем тип ID в Places
    await queryInterface.changeColumn('Places', 'id', {
      type: Sequelize.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    });

    // Изменяем тип ID в Collections
    await queryInterface.changeColumn('Collections', 'id', {
      type: Sequelize.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    });

    // Изменяем тип collection_id в CollectionPlaces
    await queryInterface.changeColumn('CollectionPlaces', 'collection_id', {
      type: Sequelize.BIGINT,
      allowNull: false,
      references: {
        model: 'Collections',
        key: 'id'
      }
    });

    // Изменяем тип place_id в CollectionPlaces
    await queryInterface.changeColumn('CollectionPlaces', 'place_id', {
      type: Sequelize.BIGINT,
      allowNull: false,
      references: {
        model: 'Places',
        key: 'id'
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Возвращаем тип ID в Places
    await queryInterface.changeColumn('Places', 'id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    });

    // Возвращаем тип ID в Collections
    await queryInterface.changeColumn('Collections', 'id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    });

    // Возвращаем тип collection_id в CollectionPlaces
    await queryInterface.changeColumn('CollectionPlaces', 'collection_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Collections',
        key: 'id'
      }
    });

    // Возвращаем тип place_id в CollectionPlaces
    await queryInterface.changeColumn('CollectionPlaces', 'place_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Places',
        key: 'id'
      }
    });
  }
};
