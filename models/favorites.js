module.exports = (sequelize, DataTypes) => {

    const FavoriteVideo = sequelize.define('FavoriteVideos', {
        Id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        Name: {
            type: DataTypes.STRING(100),
            unique: true,
            allowNull: false
        }
    }, {
            timestamps: false
        });

    return FavoriteVideo;
}