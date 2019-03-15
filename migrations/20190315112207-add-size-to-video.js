'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'Videos',
      'Size',
      {
        type: Sequelize.INTEGER,
        allowNull: true
      }
    );
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'Videos',
      'Size'
    );
  }
};
