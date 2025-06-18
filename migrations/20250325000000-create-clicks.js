'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Clicks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      place_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'Places',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      click_type: {
        type: Sequelize.ENUM(
          'social_instagram',
          'social_telegram',
          'social_vk',
          'social_website',
          'story',
          'video',
          'guide_link',
          'user_photo'
        ),
        allowNull: false
      },
      target_id: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'ID of the specific item clicked (story_id, photo_id, etc)'
      },
      source: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Source of click (web, mobile, etc)'
      },
      clicked_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Индексы для быстрой выборки статистики
    await queryInterface.addIndex('Clicks', ['place_id', 'click_type']);
    await queryInterface.addIndex('Clicks', ['clicked_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Clicks');
  }
}; 