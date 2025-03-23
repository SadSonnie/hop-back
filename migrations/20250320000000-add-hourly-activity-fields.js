'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Добавляем поле date
    await queryInterface.addColumn('MetricsData', 'date', {
      type: Sequelize.DATEONLY,
      allowNull: true
    });

    // Добавляем поле count
    await queryInterface.addColumn('MetricsData', 'count', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false
    });

    // Добавляем составной индекс для быстрого поиска по metric_id, date и value (hour)
    await queryInterface.addIndex('MetricsData', {
      fields: ['metric_id', 'date', 'value'],
      name: 'metrics_data_hourly_activity_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('MetricsData', 'metrics_data_hourly_activity_idx');
    await queryInterface.removeColumn('MetricsData', 'count');
    await queryInterface.removeColumn('MetricsData', 'date');
  }
};