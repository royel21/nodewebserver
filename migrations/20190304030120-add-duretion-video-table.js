'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'Videos',
      'Duration',
      {
        type: Sequelize.FLOAT(5, 2),
        defaultValue: 0,
        allowNull: false
      }
    );
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'Videos',
      'Duration'
    );
  }
};
