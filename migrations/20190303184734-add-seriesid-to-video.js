'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'Videos',
      'SerieId',
      {
        type: Sequelize.INTEGER,
        allowNull: true
      }
    );
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'Videos',
      'SerieId'
    );
  }
};
