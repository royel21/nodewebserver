const Sequelize = require("sequelize");
const path = require('path');
var dbPath = path.join('./files.db');

const db = {};

const Op = Sequelize.Op
const DataTypes = Sequelize.DataTypes
const sequelize = new Sequelize('sqlite:./' + dbPath, {
    logging: false,
    // logging: console.log,
    operatorsAliases: {
        $and: Op.and,
        $or: Op.or,
        $eq: Op.eq,
        $gt: Op.gt,
        $lt: Op.lt,
        $lte: Op.lte,
        $like: Op.like,
        $ne: Op.not
    }
});

db.Op = Op;

db.user = require('./user')(sequelize, DataTypes);
db.file = require('./file')(sequelize, DataTypes);
db.category = require('./category')(sequelize, DataTypes);
db.folder = require('./folder')(sequelize, DataTypes);
db.favorite = require('./favorites')(sequelize, DataTypes);
db.recent = require('./recents')(sequelize, DataTypes);
db.directory = require('./directories')(sequelize, DataTypes);

db.recentFile = require('./recent-file')(sequelize, DataTypes);
db.favoriteFile = require('./favorite-file')(sequelize, DataTypes);
db.fileCategory = require('./file-category')(sequelize, DataTypes);

db.sqlze = sequelize;

db.user.afterCreate((user, options) => {
    if (!['manager', 'admin'].includes(user.Role)) {
        db.favorite.create({
            Name: user.Name,
            UserId: user.Id
        });
    }
});

db.user.afterCreate((user, options) => {
    if (!['manager', 'admin'].includes(user.Role)) {
        db.recent.create({
            Name: user.Name,
            UserId: user.Id
        });
    }
});

db.category.belongsToMany(db.file, { through: { model: db.fileCategory } });
db.file.belongsToMany(db.category, { through: { model: db.fileCategory } });

db.favorite.belongsToMany(db.file, { through: { model: db.favoriteFile } });
db.file.belongsToMany(db.favorite, { through: { model: db.favoriteFile } });

db.recent.belongsToMany(db.file, { through: { model: db.recentFile } });
db.file.belongsToMany(db.recent, { through: { model: db.recentFile } });

db.directory.hasMany(db.file, { onDelete: 'cascade' });
db.directory.hasMany(db.folder, { onDelete: 'cascade' });

db.folder.belongsTo(db.directory);

db.file.belongsTo(db.directory);
db.file.belongsTo(db.folder);

db.user.hasOne(db.favorite);
db.user.hasOne(db.recent);
db.folder.hasMany(db.file);

db.init = async() => {
    await sequelize.sync();

    if (await db.user.findOne({ where: { Name: "Administrator" } }) == null) {

        await db.user.create({
            Name: "Administrator",
            Password: "Admin",
            Role: "admin"
        });
    }

    // if (await db.category.findOne({ where: { Name: "Aventuras" } }) == null) {
    //     let categories = [{
    //         Name: "Aventuras"
    //     }, {
    //         Name: "Acción"
    //     }, {
    //         Name: "Ciencia Ficción"
    //     }, {
    //         Name: "Animación"
    //     }, {
    //         Name: "Artes Marciales‎"
    //     }, {
    //         Name: "Histórico"
    //     }, {
    //         Name: "Guerras"
    //     }, {
    //         Name: "Misterio"
    //     }, {
    //         Name: "Infantiles"
    //     }, {
    //         Name: "Documentales"
    //     }, {
    //         Name: "Dramas"
    //     }, {
    //         Name: "Fantasia"
    //     }];
    //     await db.category.bulkCreate(categories)
    // }
}

module.exports = db;