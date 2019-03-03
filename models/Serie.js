module.exports = (sequelize, DataTypes) =>{

    const Serie = sequelize.define('Serie', {
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
    return Serie;
}


