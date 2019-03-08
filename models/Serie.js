module.exports = (sequelize, DataTypes) =>{

    const Serie = sequelize.define('Serie', {
        Id: {
            type: DataTypes.STRING(10),
            primaryKey: true,
            unique: true,
            allowNull: false
        },
        Name: {
            type: DataTypes.STRING(100),
            unique: true
        },
        CoverPath:{
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
            timestamps: false
        });
    return Serie;
}


