module.exports = (sequelize, DataTypes) =>{

    const Category = sequelize.define('Category', {
        Id: {
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


