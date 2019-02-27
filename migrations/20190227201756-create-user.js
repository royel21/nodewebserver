'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Users', {
      Id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      Name: {
        type: Sequelize.STRING(100),
        unique: true,
        allowNull: false
      },
      Password: {
        type: Sequelize.STRING(32),
        allowNull: false
      },
      Role: {
        type: Sequelize.STRING(20),
        defaultValue: "user",
        allowNull: false
      },
      State: {
        type: Sequelize.STRING(12),
        defaultValue: "Activo",
        allowNull: false
      },
      CreatedAt: {
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Users');
  }
};