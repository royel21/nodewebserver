module.exports = (sequelize, DataTypes) => {

    const Video = sequelize.define('Videos', {
        Id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        VideoName: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
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