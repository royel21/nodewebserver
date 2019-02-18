const Sequelize = require("sequelize");
const path = require('path');
const fs = require('fs-extra');
var dbPath = path.join('./video.db');
var bcrypt = require('bcrypt');

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
db.generateHash = (password) => bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);


db.video.belongsToMany(db.category, {
    through: 'videocategory',
    as: 'Category',
    foreignKey: 'VideoId'
});

db.favorite.hasMany(db.video);
db.favorite.belongsTo(db.user);

db.init = async (isforce) => {
    if (!fs.existsSync(dbPath) || isforce) {
        await sequelize.sync({
            logging: console.log,
            force: isforce
        });

        await db.user.create({
            username: "Admin",
            password: db.generateHash("Admin"),
            role: "admin",
            createdAt: new Date()
        });
    }
}

module.exports = db;