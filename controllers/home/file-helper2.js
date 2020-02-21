const db = require('../../models');

const getOrderBy = (orderby) => {
    let order = [];
    switch (orderby) {
        case 'nd':
            {
                order.push([db.sqlze.col('N'), 'DESC']);
                break;
            }
        case 'du':
            {
                order.push(["CreatedAt", 'DESC']);
                break;
            }
        case 'dd':
            {
                order.push(["CreatedAt", 'ASC']);
                break;
            }
        case 'recent':
            {
                order.push([db.sqlze.literal("LastRead"), 'DESC']);
                break;
            }
        default:
            {
                order.push(db.sqlze.col('N'));
            }
    }
    return order;
}

exports.getFiles = async(data, models, order) => {
    let files = { count: 0, rows: [] };
    let searchs = [];
    for (let s of data.search.split('|')) {
        searchs.push({
            Name: {
                [db.Op.like]: "%" + s + "%"
            }
        });
    }

    files = await db.file.findAndCountAll({
        attributes: {
            include: [
                [db.sqlze.literal("REPLACE(File.Name, '[','0')"), 'N'],
                [db.sqlze.literal("`Recents->RecentFiles`.`LastRead`"), 'LastRead'],
                [db.sqlze.literal("`Recents->RecentFiles`.`LastPos`"), 'CurrentPos'],
                [db.sqlze.literal("`Favorites`.`UserId`"), 'isFav']
            ]
        },
        offset: data.begin,
        limit: data.itemsPerPage,
        order: getOrderBy(order, data),
        include: models,
        where: {
            [db.Op.or]: searchs
        }
    });
    return files;
}