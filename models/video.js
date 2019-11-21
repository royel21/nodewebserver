module.exports = (sequelize, DataTypes) => {

    const Video = sequelize.define('Video', {
        Id: {
            type: DataTypes.STRING(10),
            primaryKey: true,
            unique: true,
            allowNull: false
        },
        Name: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        NameNormalize:
        {
            type: DataTypes.STRING(100)
        },
        Year: {
            type: DataTypes.DATE,
            allowNull: true
        },
        Description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        Duration: {
            type: DataTypes.FLOAT(8, 2),
            defaultValue: 0,
            allowNull: false
        },
        FullPath: {
            type: DataTypes.STRING,
            defaultValue: "",
            allowNull: false
        },
        Size:{
            type: DataTypes.INTEGER,
            allowNull: true
        },
        CreatedAt: {
            type: DataTypes.DATE
        }
    }, {
            timestamps: false,
            hooks: {
                beforeCreate: (video, options) => {
                    video.CreatedAt = new Date();
                },
                beforeBulkCreate: (videos, options) => {
                    videos.forEach((video) => {
                        video.CreatedAt = new Date();
                    });
                }
            }
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