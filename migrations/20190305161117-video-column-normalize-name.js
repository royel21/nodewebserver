'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'Videos',
      'NameNormalize',
      {
        type: Sequelize.STRING(100)
      }
    );
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'Videos',
      'NameNormalize'
    );
  }
};
