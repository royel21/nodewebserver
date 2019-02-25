module.exports = (sequelize, DataTypes) => {
    
    const Video = sequelize.define('Video', {
        Id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoincrement: true

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
        TotalTime: {
            type: DataTypes.FLOAT(5, 4),
            defaultValue: 0
        }
    }, {
            timestamps: false,
            // hooks: {
            //     beforeCreate: (video, options) => {
            //         video.Id = crc16(video.Name).toString(16);
            //     },
            //     beforeBulkCreate: (videos, options) => {
            //         videos.forEach((video) => {
            //             video.Id = crc16(video.Name).toString(16);
            //         });
            //     }
            // }
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