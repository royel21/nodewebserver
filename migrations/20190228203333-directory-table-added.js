'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Directories', {
      Id: {
        type: Sequelize.STRING(20),
        unique: true,
        primaryKey: true
      },
      FullPath: {
        type: Sequelize.STRING,
        unique: true,
        allownull: false
      },
      IsLoading: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      }
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Directories');
  }
};
