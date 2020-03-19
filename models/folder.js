module.exports = (sequelize, DataTypes) => {
  const Folder = sequelize.define(
    "Folders",
    {
      Id: {
        type: DataTypes.STRING(10),
        primaryKey: true,
        unique: true,
        allowNull: false
      },
      Type: {
        type: DataTypes.STRING(7),
        defaultValue: "Folder"
      },
      Name: {
        type: DataTypes.STRING(100),
        unique: true
      },
      Cover: {
        type: DataTypes.STRING
      }
    },
    {
      timestamps: false,
      hooks: {
        beforeValidate: function(item, options) {
          item.Id = Math.random()
            .toString(36)
            .slice(-5);

          item.Cover = `/covers/${item.Type}/${item.Name.replace("#", "%23")}.jpg`;
        },
        beforeBulkCreate: (instances, options) => {
          for (var item of instances) {
            item.Id = Math.random()
              .toString(36)
              .slice(-5);
            item.Cover = `/covers/${item.Type}/${item.Name.replace("#", "%23")}.jpg`;
          }
        }
      }
    }
  );

  return Folder;
};
