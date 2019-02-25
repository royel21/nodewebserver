
var bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes, hashSync) => {
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
    State: {
      type: DataTypes.STRING(12),
      defaultValue: "Activo",
      allowNull: false
    },
    CreatedAt: {
      type: DataTypes.DATE
    }
  }, {
      timestamps: false,
      hooks: {
        beforeCreate: (user, options, cb) => {
          user.Password = bcrypt.hashSync(user.Password, bcrypt.genSaltSync(8), null);
          user.CreatedAt = new Date();
        },
        beforeBulkCreate: (users, options, cb) => {
          for (var user of users) {
            user.Password = bcrypt.hashSync(user.Password, bcrypt.genSaltSync(8), null);
          }
        }
      }
    });

    User.prototype.validPassword = function (password) {
      return new Promise((resolve, rejected) => {
        bcrypt.compare(password, this.Password, (err, result) => {
          if (err) rejected(err);
          resolve(result);
        });
      });
    }

  return User;
}