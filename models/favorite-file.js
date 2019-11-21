module.exports = (sequelize, DataTypes) => {

    const FavoriteFile = sequelize.define('FavoriteFile', {
        Id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }
    }, {
        timestamps: false,
        uniqueKeys: {
            FavoriteFile_unique: {
                fields: ['FavoriteId', 'FileId']
            }
        }
    });

    return FavoriteFile;
}