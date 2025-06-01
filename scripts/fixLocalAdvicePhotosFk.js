const { sequelize } = require('../models');

async function fixForeignKey() {
  try {
    await sequelize.query('BEGIN');
    
    // Удаляем существующие записи
    await sequelize.query('DELETE FROM "LocalAdvicePhotos";');
    
    // Удаляем существующие ограничения
    await sequelize.query('ALTER TABLE "LocalAdvicePhotos" DROP CONSTRAINT IF EXISTS "LocalAdvicePhotos_local_advice_id_fkey1";');
    await sequelize.query('ALTER TABLE "LocalAdvicePhotos" DROP CONSTRAINT IF EXISTS "LocalAdvicePhotos_local_advice_id_fkey";');
    
    // Добавляем новое ограничение
    await sequelize.query(`
      ALTER TABLE "LocalAdvicePhotos"
      ADD CONSTRAINT "LocalAdvicePhotos_local_advice_id_fkey"
      FOREIGN KEY ("local_advice_id")
      REFERENCES "LocalAdvice"("id")
      ON DELETE CASCADE
      ON UPDATE CASCADE;
    `);
    
    await sequelize.query('COMMIT');
    console.log('Foreign key constraint fixed successfully');
  } catch (error) {
    await sequelize.query('ROLLBACK');
    console.error('Error fixing foreign key constraint:', error);
  } finally {
    await sequelize.close();
  }
}

fixForeignKey(); 