export default (sequelize, DataTypes) => {
    const Users = sequelize.define('Users', {
      username: {
        allowNull: false,
        type: DataTypes.STRING,
        unique: true,
        validate: {
          notEmpty: true
        }
      },
      password: {
        allowNull: false,
        type: DataTypes.STRING,
        validate: {
          notEmpty: true
        }
      }
    });
    return Users;
  };