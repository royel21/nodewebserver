
module.exports = (sequelize, DataTypes, hashSync) => {
  const UserConfigs = sequelize.define('UserConfigs', {
    Id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    Configs: {
      type: DataTypes.STRING
    }
  }, {
      timestamps: false,
      hooks: {
        beforeCreate: (config, options) => {

        },
        beforeBulkCreate: (UserConfigs, options) => {
          for (var user of users) {
            user.Password = bcrypt.hashSync(user.Password, bcrypt.genSaltSync(8), null);
          }
        }
      }
    });

  return User;
}