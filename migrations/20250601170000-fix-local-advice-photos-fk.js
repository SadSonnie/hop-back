'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Удаляем существующие записи, так как они могут конфликтовать
    await queryInterface.sequelize.query('DELETE FROM "LocalAdvicePhotos";');
    
    // Удаляем существующее ограничение
    await queryInterface.sequelize.query('ALTER TABLE "LocalAdvicePhotos" DROP CONSTRAINT IF EXISTS "LocalAdvicePhotos_local_advice_id_fkey1";');
    await queryInterface.sequelize.query('ALTER TABLE "LocalAdvicePhotos" DROP CONSTRAINT IF EXISTS "LocalAdvicePhotos_local_advice_id_fkey";');
    
    // Добавляем новое ограничение
    await queryInterface.sequelize.query(`
      ALTER TABLE "LocalAdvicePhotos"
      ADD CONSTRAINT "LocalAdvicePhotos_local_advice_id_fkey"
      FOREIGN KEY ("local_advice_id")
      REFERENCES "LocalAdvice"("id")
      ON DELETE CASCADE
      ON UPDATE CASCADE;
    `);
  },

  async down(queryInterface, Sequelize) {
    // В случае отката возвращаем старое ограничение
    await queryInterface.sequelize.query('ALTER TABLE "LocalAdvicePhotos" DROP CONSTRAINT IF EXISTS "LocalAdvicePhotos_local_advice_id_fkey";');
    
    await queryInterface.sequelize.query(`
      ALTER TABLE "LocalAdvicePhotos"
      ADD CONSTRAINT "LocalAdvicePhotos_local_advice_id_fkey1"
      FOREIGN KEY ("local_advice_id")
      REFERENCES "LocalAdvice"("id")
      ON DELETE CASCADE
      ON UPDATE CASCADE;
    `);
  }
}; 