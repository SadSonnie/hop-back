'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Сначала удалим существующие внешние ключи
    await queryInterface.removeConstraint('CollectionPlaces', 'CollectionPlaces_collection_id_fkey');
    await queryInterface.removeConstraint('CollectionPlaces', 'CollectionPlaces_place_id_fkey');

    // Изменим тип ID в Places
    await queryInterface.changeColumn('Places', 'id', {
      type: Sequelize.BIGINT,
      allowNull: false,
      primaryKey: true
    });

    // Изменим тип ID в Collections
    await queryInterface.changeColumn('Collections', 'id', {
      type: Sequelize.BIGINT,
      allowNull: false,
      primaryKey: true
    });

    // Изменим тип внешних ключей в CollectionPlaces
    await queryInterface.changeColumn('CollectionPlaces', 'collection_id', {
      type: Sequelize.BIGINT,
      allowNull: false
    });

    await queryInterface.changeColumn('CollectionPlaces', 'place_id', {
      type: Sequelize.BIGINT,
      allowNull: false
    });

    // Восстановим внешние ключи с новым типом данных
    await queryInterface.addConstraint('CollectionPlaces', {
      fields: ['collection_id'],
      type: 'foreign key',
      name: 'CollectionPlaces_collection_id_fkey',
      references: {
        table: 'Collections',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('CollectionPlaces', {
      fields: ['place_id'],
      type: 'foreign key',
      name: 'CollectionPlaces_place_id_fkey',
      references: {
        table: 'Places',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    // Изменим тип в FeedOrders
    await queryInterface.changeColumn('FeedOrders', 'itemId', {
      type: Sequelize.BIGINT,
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Сначала удалим существующие внешние ключи
    await queryInterface.removeConstraint('CollectionPlaces', 'CollectionPlaces_collection_id_fkey');
    await queryInterface.removeConstraint('CollectionPlaces', 'CollectionPlaces_place_id_fkey');

    // Вернем тип ID в Places
    await queryInterface.changeColumn('Places', 'id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true
    });

    // Вернем тип ID в Collections
    await queryInterface.changeColumn('Collections', 'id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true
    });

    // Вернем тип внешних ключей в CollectionPlaces
    await queryInterface.changeColumn('CollectionPlaces', 'collection_id', {
      type: Sequelize.INTEGER,
      allowNull: false
    });

    await queryInterface.changeColumn('CollectionPlaces', 'place_id', {
      type: Sequelize.INTEGER,
      allowNull: false
    });

    // Восстановим внешние ключи с прежним типом данных
    await queryInterface.addConstraint('CollectionPlaces', {
      fields: ['collection_id'],
      type: 'foreign key',
      name: 'CollectionPlaces_collection_id_fkey',
      references: {
        table: 'Collections',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('CollectionPlaces', {
      fields: ['place_id'],
      type: 'foreign key',
      name: 'CollectionPlaces_place_id_fkey',
      references: {
        table: 'Places',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    // Вернем тип в FeedOrders
    await queryInterface.changeColumn('FeedOrders', 'itemId', {
      type: Sequelize.INTEGER,
      allowNull: false
    });
  }
};
