module.exports = (sequelize, DataTypes) =>{

    const Category = sequelize.define('Category', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        Name: {
            type: DataTypes.STRING(100),
            unique: true
        }
    }, {
            timestamps: false
        });
    return Category;
}


