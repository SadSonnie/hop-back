'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE "Articles" 
      ALTER COLUMN content TYPE JSONB 
      USING CASE 
        WHEN content IS NULL THEN '{"blocks":[]}'::jsonb
        WHEN content::text = '' THEN '{"blocks":[]}'::jsonb
        ELSE json_build_object(
          'blocks', 
          json_build_array(
            json_build_object(
              'id', concat('block_', extract(epoch from now())::text, '_', md5(random()::text)),
              'type', 'text',
              'content', content
            )
          )
        )::jsonb
      END;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "Articles" 
      ALTER COLUMN content SET DEFAULT '{"blocks":[]}'::jsonb;
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE "Articles"
      ALTER COLUMN content TYPE TEXT
      USING CASE
        WHEN content IS NULL THEN NULL
        ELSE (content#>>'{blocks,0,content}')::text
      END;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "Articles"
      ALTER COLUMN content DROP DEFAULT;
    `);
  }
}; 