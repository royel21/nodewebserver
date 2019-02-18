module.exports = (sequelize, DataTypes) => {

  const User = sequelize.define('user', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    role: {
      type: DataTypes.STRING(20),
      defaultValue: "User"
    },
    createdAt: {
      type: DataTypes.DATE
    }
  }, {
      timestamps: false
    });

  return User;
}