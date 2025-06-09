'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Проверяем существование колонки content
    const tableInfo = await queryInterface.describeTable('Articles');
    
    if (!tableInfo.content) {
      // Если колонки нет, создаем её
      await queryInterface.addColumn('Articles', 'content', {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: { blocks: [] }
      });
    } else {
      // Если колонка есть, получаем существующие данные
      const articles = await queryInterface.sequelize.query(
        'SELECT id, content FROM "Articles" WHERE content IS NOT NULL;',
        { type: Sequelize.QueryTypes.SELECT }
      );

      // Обновляем тип колонки на JSONB
      await queryInterface.changeColumn('Articles', 'content', {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: { blocks: [] }
      });

      // Преобразуем старые текстовые данные в новый формат с блоками
      for (const article of articles) {
        if (article.content) {
          const newContent = {
            blocks: [
              {
                id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type: 'text',
                content: article.content
              }
            ]
          };

          await queryInterface.sequelize.query(
            'UPDATE "Articles" SET content = :content WHERE id = :id',
            {
              replacements: { 
                content: newContent,
                id: article.id 
              },
              type: Sequelize.QueryTypes.UPDATE
            }
          );
        }
      }
    }
  },

  async down(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('Articles');
    
    if (tableInfo.content) {
      // Получаем данные перед изменением
      const articles = await queryInterface.sequelize.query(
        'SELECT id, content FROM "Articles" WHERE content IS NOT NULL;',
        { type: Sequelize.QueryTypes.SELECT }
      );

      // Изменяем тип колонки обратно на TEXT
      await queryInterface.changeColumn('Articles', 'content', {
        type: Sequelize.TEXT,
        allowNull: true
      });

      // Преобразуем JSON данные обратно в текст
      for (const article of articles) {
        if (article.content && article.content.blocks && article.content.blocks.length > 0) {
          // Собираем весь текст из блоков
          const textContent = article.content.blocks
            .filter(block => block.type === 'text')
            .map(block => block.content)
            .join('\n\n');

          await queryInterface.sequelize.query(
            'UPDATE "Articles" SET content = :content WHERE id = :id',
            {
              replacements: { 
                content: textContent || null,
                id: article.id 
              },
              type: Sequelize.QueryTypes.UPDATE
            }
          );
        }
      }
    }
  }
}; 