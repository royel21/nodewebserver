module.exports = (sequelize, DataTypes) => {

    const Favorite = sequelize.define('Favorite', {
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

    return Favorite;
}