
module.exports = (sequelize, DataTypes) => {
  const Directory = sequelize.define('Directory', {
    Id: {
      type: DataTypes.STRING(20),
      unique: true,
      primaryKey: true
    },
    FullPath: {
      type: DataTypes.STRING,
      unique: true,
      allownull: false
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