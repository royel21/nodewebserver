module.exports = (sequelize, DataTypes) => {

  const User = sequelize.define('User', {
    Id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    Name: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: false
    },
    Password: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    Role: {
      type: DataTypes.STRING(20),
      defaultValue: "user",
      allowNull: false
    },
    State:{
      type: DataTypes.STRING(12),
      defaultValue: "Activo",
      allowNull: false
    },
    CreatedAt: {
      type: DataTypes.DATE
    }
  }, {
      timestamps: false
    });

  return User;
}