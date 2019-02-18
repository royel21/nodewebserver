module.exports = (sequelize, DataTypes) => {

    const FavoriteVideo = sequelize.define('favoritevideos', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        username: {
            type: DataTypes.STRING(100),
            unique: true,
            allowNull: false
        }
    }, {
            timestamps: false
        });

    return FavoriteVideo;
}