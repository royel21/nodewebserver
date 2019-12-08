module.exports = (sequelize, DataTypes) => {

    const RecentFile = sequelize.define('RecentFiles', {
        Id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        LastRead: {
            type: DataTypes.DATE
        },
        LastPos: {
            type: DataTypes.FLOAT(8, 2).UNSIGNED,
            defaultValue: 0
        }
    }, {
        timestamps: false,
        uniqueKeys: {
            RecentFile_unique: {
                fields: ['RecentId', 'FileId']
            }
        },
        hooks: {
            beforeCreate: (item, options) => {
                item.LastRead = new Date();
            }
        }
    });

    return RecentFile;
}