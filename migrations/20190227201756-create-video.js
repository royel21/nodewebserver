'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Videos', {
      Id: {
          type: Sequelize.STRING(20),
          primaryKey: true,
          unique: true,
          allowNull: false
      },
      Name: {
          type: Sequelize.STRING(100),
          unique: true,
          allowNull: false
      },
      Year: {
          type: Sequelize.DATE,
          allowNull: true
      },
      Description: {
          type: Sequelize.TEXT,
          allowNull: true
      },
      FilePath: {
          type: Sequelize.STRING(300)
      },
      CreatedAt: {
          type: Sequelize.DATE
        }
  });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Videos');
  }
};