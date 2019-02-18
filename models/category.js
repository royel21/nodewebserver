module.exports = (sequelize, DataTypes) =>{

    const Category = sequelize.define('Categories', {
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


