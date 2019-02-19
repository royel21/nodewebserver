module.exports = (sequelize, DataTypes) => {

    const Video = sequelize.define('Video', {
        Id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        Name: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        Year:{
            type: DataTypes.INTEGER,
            allowNull: true
        },
        Description:{
            type: DataTypes.TEXT,
            allowNull: true
        },
        FilePath:{
            type: DataTypes.STRING
        },
        TotalTime: {
            type: DataTypes.INTEGER(6).UNSIGNED,
            defaultValue: 0
        }
    }, {
            timestamps: false
        });

    Video.findByName = (name) => {
        return Video.findOne({
            where: {
                Name: name
            }
        });
    }

    return Video;
}