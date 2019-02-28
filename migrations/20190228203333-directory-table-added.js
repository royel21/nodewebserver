'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Directories', {
      Id: {
        type: Sequelize.STRING(20),
        unique: true,
        primaryKey: true,
        allowNull: false
      },
      FullPath: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
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
