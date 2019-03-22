module.exports = (sequelize, DataTypes) => {

    const VideoCategory = sequelize.define('VideoCategory', {
        Id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }
    }, {
            timestamps: false,
            uniqueKeys: {
                VideoCategory_unique: {
                    fields: ['CategoryId', 'VideoId']
                }
            }
        });

    return VideoCategory;
}