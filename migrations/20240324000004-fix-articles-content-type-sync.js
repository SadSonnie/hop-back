'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First, ensure any existing content is valid JSON
    await queryInterface.sequelize.query(`
      UPDATE "Articles"
      SET content = '{"blocks":[]}'::jsonb
      WHERE content IS NULL OR content = '';
    `);

    // Then convert non-empty content to proper JSON structure
    await queryInterface.sequelize.query(`
      UPDATE "Articles"
      SET content = json_build_object(
        'blocks',
        json_build_array(
          json_build_object(
            'id', concat('block_', extract(epoch from now())::text),
            'type', 'text',
            'content', content
          )
        )
      )::jsonb
      WHERE content IS NOT NULL AND content != '{"blocks":[]}'::jsonb;
    `);

    // Finally set the column type to JSONB
    await queryInterface.sequelize.query(`
      ALTER TABLE "Articles"
      ALTER COLUMN content TYPE JSONB
      USING content::jsonb;
    `);

    // Set the default value
    await queryInterface.sequelize.query(`
      ALTER TABLE "Articles"
      ALTER COLUMN content SET DEFAULT '{"blocks":[]}'::jsonb;
    `);
  },

  async down(queryInterface, Sequelize) {
    // Convert JSONB content back to text
    await queryInterface.sequelize.query(`
      UPDATE "Articles"
      SET content = content#>>'{blocks,0,content}'
      WHERE content IS NOT NULL;
    `);

    // Change column type back to TEXT
    await queryInterface.sequelize.query(`
      ALTER TABLE "Articles"
      ALTER COLUMN content TYPE TEXT;
    `);

    // Remove default value
    await queryInterface.sequelize.query(`
      ALTER TABLE "Articles"
      ALTER COLUMN content DROP DEFAULT;
    `);
  }
}; 