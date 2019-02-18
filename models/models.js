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
db.user.hasOne(db.favorite);

db.init = async (isforce) => {
    if (!fs.existsSync(dbPath) || isforce) {
        await sequelize.sync({
            logging: console.log,
            force: isforce
        });
        let users = [{
            Name: "Admin",
            Password: db.generateHash("Admin"),
            Role: "admin",
            CreatedAt: new Date()
        }, {
            Name: "Rconsoro",
            Password: db.generateHash("123456"),
            CreatedAt: new Date()
        }, {
            Name: "Rmarero",
            Password: db.generateHash("123456"),
            CreatedAt: new Date()
        }];
        db.user.bulkCreate(users).then(()=>{
            console.log("users created")
        }).catch(err=>{
            console.log(err)
        });
    }
}

module.exports = db;