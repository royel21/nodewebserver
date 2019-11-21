module.exports = (sequelize, DataTypes) => {

    const Manga = sequelize.define('Manga', {
        Id: {
            type: DataTypes.STRING(10),
            primaryKey: true,
            unique: true,
            allowNull: false
        },
        Name: {
            type: DataTypes.STRING(150)
        },
        Current: {
            type: DataTypes.INTEGER(5).UNSIGNED,
            defaultValue: 0
        },
        Total: {
            type: DataTypes.INTEGER(5).UNSIGNED,
            defaultValue: 0
        },
        Size: {
            type: DataTypes.INTEGER.UNSIGNED
        },
        CreatedAt: {
            type: DataTypes.DATE
        }
    }, {
            timestamps: false,
            hooks: {
                beforeCreate: (manga, options) => {
                    manga.CreatedAt = new Date();
                },
                beforeBulkCreate: (manga, options) => {
                    manga.forEach((manga) => {
                        manga.CreatedAt = new Date();
                    });
                }
            }
        });

    Manga.findByName = (name) => {
        return Manga.findOne({
            where: {
                Name: name
            }
        });
    }

    return Manga;
}