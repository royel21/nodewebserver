module.exports = (sequelize, DataTypes) => {

    const RecentFile = sequelize.define('RecentFile', {
        Id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        LastRead: {
            type: DataTypes.DATE
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