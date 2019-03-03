'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'Videos',
      'FullPath',
      {
        type: Sequelize.STRING,
        defaultValue: "",
        allowNull: false
      }
    );
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'Videos',
      'FullPath'
    );
  }
};
