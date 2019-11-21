module.exports = (sequelize, DataTypes) => {

    const FileCategory = sequelize.define('FileCategory', {
        Id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }
    }, {
            timestamps: false,
            uniqueKeys: {
                FileCategory_unique: {
                    fields: ['CategoryId', 'FileId']
                }
            }
        });

    return FileCategory;
}