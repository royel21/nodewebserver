'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Series', {
      Id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      Name: {
        type: Sequelize.STRING(100),
        unique: true
      }
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Series');
  }
};