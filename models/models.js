const Sequelize = require("sequelize");
const path = require('path');
const fs = require('fs-extra');
const os = require('os');

var dbPath = path.join(os.homedir(), './video.db');

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
        unique: true
    },
    Password: {
        type: Sequelize.STRING
    }
});

const Video = db.define('Videos', {
    Id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Name: {
        type: Sequelize.STRING
    },
    Current: {
        type: Sequelize.INTEGER(5).UNSIGNED,
        defaultValue: 0
    },
    Total: {
        type: Sequelize.INTEGER(5).UNSIGNED,
        defaultValue: 0
    },
    Size: {
        type: Sequelize.INTEGER.UNSIGNED
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
        unique: true
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

Video.hasMany(Category);
Category.hasMany(Video);
FavoriteVideo.hasMany(Video);
FavoriteVideo.belongsTo(User);

init = async (isforce) => {
    if (!fs.existsSync(dbPath) || isforce) {
        await db.sync({
            logging: console.log,
            force: isforce
        });
    }
}

module.exports = {
    User,
    Video,
    FavoriteVideo,
    init,
    Op,
    db
}