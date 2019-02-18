const Sequelize = require("sequelize");
const path = require('path');
const fs = require('fs-extra');
var dbPath = path.join('./video.db');
var bcrypt = require('bcrypt');

const generateHash = (password) => bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);

const Op = Sequelize.Op
const DataTypes = Sequelize.DataTypes
const db = new Sequelize('sqlite:./' + dbPath, {
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

const User = db.define('user', {
    Id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    UserName: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
    Password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    createdAt: {
        type: Sequelize.DATE
    }
}, {
        timestamps: false
    });

const Video = db.define('Videos', {
    Id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    VideoName: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
    TotalTime: {
        type: Sequelize.INTEGER(5).UNSIGNED,
        defaultValue: 0
    }
}, {
        timestamps: false
    });

Video.findByName = (name) => {
    return Video.findOne({
        where: {
            Name: name
        }
    });
}

const FavoriteVideo = db.define('favoritevideos', {
    Id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    UserName: {
        type: Sequelize.STRING(100),
        unique: true,
        allowNull: false
    }
}, {
        timestamps: false
    });

const Category = db.define('Category', {
    Id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Name: {
        type: Sequelize.STRING(100),
        unique: true
    }
}, {
        timestamps: false
    });

Video.belongsToMany(Category, {
    through: 'videocategory',
    as: 'Category',
    foreignKey: 'VideoId'
});

FavoriteVideo.hasMany(Video);
FavoriteVideo.belongsTo(User);

init = async (isforce) => {
    if (!fs.existsSync(dbPath) || isforce) {
        await db.sync({
            logging: console.log,
            force: isforce
        });

        await User.create({
            UserName: "Admin",
            Password: generateHash("Admin"),
            createdAt: new Date()
        });
    }
}

module.exports = {
    User,
    Video,
    FavoriteVideo,
    init,
    Op,
    db,
    generateHash
}