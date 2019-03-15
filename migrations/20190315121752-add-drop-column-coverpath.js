'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {

    return queryInterface.removeColumn(
      'Videos',
      'CoverPath'
    );
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'Videos',
      'CoverPath',
      {
        type: DataTypes.STRING,
        allowNull: true
      }
    );
  }
};
