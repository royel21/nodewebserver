const Sequelize = require("sequelize");
const path = require('path');
const fs = require('fs-extra');
var dbPath = path.join('./video.db');

const db = {};

const Op = Sequelize.Op
const DataTypes = Sequelize.DataTypes
const sequelize = new Sequelize('sqlite:./' + dbPath, {
    logging: false,
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
db.video = require('./video')(sequelize, DataTypes);
db.category = require('./category')(sequelize, DataTypes);
db.favorite = require('./favorites')(sequelize, DataTypes);
db.sequelize = sequelize;

db.video.belongsToMany(db.category, {
    through: 'videocategory',
    as: 'Category',
    foreignKey: 'VideoId'
});

db.favorite.hasMany(db.video);
db.user.hasOne(db.favorite);

db.init = async (isforce) => {
    if (!fs.existsSync(dbPath) || isforce) {
        await sequelize.sync({
            logging: false,
            force: isforce
        });
        let users = [{
            Name: "Admin",
            Password: "Admin",
            Role: "admin"
        }, {
            Name: "Rconsoro",
            Password: "123456"
        }, {
            Name: "Rmarero",
            Password: "123456"
        }];
        await db.user.bulkCreate(users);

        let categories = [{
            Name: "Aventuras"
        }, {
            Name: "Acción"
        }, {
            Name: "Ciencia Ficción"
        }, {
            Name: "Animación"
        }, {
            Name: "Artes Marciales‎"
        }, {
            Name: "Histórico"
        }, {
            Name: "Guerras"
        }, {
            Name: "Misterio"
        }, {
            Name: "Infantiles"
        }, {
            Name: "Documentales"
        }, {
            Name: "Dramas"
        }, {
            Name: "Fantacias"
        }];
        await db.category.bulkCreate(categories);
    }
}

module.exports = db;