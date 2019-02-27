'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Favorites', {
      Id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
      },
      Name: {
          type: Sequelize.STRING(100),
          unique: true,
          allowNull: false
      }
  });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Favorites');
  }
};