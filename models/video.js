module.exports = (sequelize, DataTypes) => {
    
    const Video = sequelize.define('Video', {
        Id: {
            type: DataTypes.STRING,
            primaryKey: true,
            unique: true,
            allowNull: false
        },
        Name: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        Year: {
            type: DataTypes.DATE,
            allowNull: true
        },
        Description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        FilePath: {
            type: DataTypes.STRING
        },
        CreatedAt: {
            type: DataTypes.DATE
          }
    }, {
            timestamps: false,
            hooks: {
                beforeCreate: (video, options) => {
                    video.Id = crc16(video.Name).toString(16);
                    video.CreatedAt = new Date();
                },
                beforeBulkCreate: (videos, options) => {
                    videos.forEach((video) => {
                        video.Id = crc16(video.Name).toString(16);
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