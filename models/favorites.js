module.exports = (sequelize, DataTypes) => {

    const FavoriteVideo = sequelize.define('Favorite', {
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