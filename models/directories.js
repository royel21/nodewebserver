
module.exports = (sequelize, DataTypes) => {
  const Directory = sequelize.define('Directory', {
    Id: {
      type: DataTypes.STRING(20),
      unique: true,
      primaryKey: true,
      allowNull: false
    },
    FullPath: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    IsLoading: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
      timestamps: false
    });

  return Directory;
}