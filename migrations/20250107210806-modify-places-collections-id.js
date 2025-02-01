'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      -- Изменяем тип ID в Places
      ALTER TABLE "Places" 
      ALTER COLUMN id TYPE BIGINT USING id::BIGINT;

      -- Изменяем тип ID в Collections
      ALTER TABLE "Collections" 
      ALTER COLUMN id TYPE BIGINT USING id::BIGINT;

      -- Изменяем тип collection_id в CollectionPlaces
      ALTER TABLE "CollectionPlaces" 
      ALTER COLUMN collection_id TYPE BIGINT USING collection_id::BIGINT,
      ALTER COLUMN place_id TYPE BIGINT USING place_id::BIGINT;
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      -- Возвращаем тип ID в Places
      ALTER TABLE "Places" 
      ALTER COLUMN id TYPE INTEGER USING id::INTEGER;

      -- Возвращаем тип ID в Collections
      ALTER TABLE "Collections" 
      ALTER COLUMN id TYPE INTEGER USING id::INTEGER;

      -- Возвращаем типы в CollectionPlaces
      ALTER TABLE "CollectionPlaces" 
      ALTER COLUMN collection_id TYPE INTEGER USING collection_id::INTEGER,
      ALTER COLUMN place_id TYPE INTEGER USING place_id::INTEGER;
    `);
  }
};