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
        default:
            {
                order.push(db.sqlze.col('N'));
            }
    }
    return order;
}

exports.getOrderBy = getOrderBy;

exports.getFiles = async(user, data, model, order) => {
    let files = { count: 0, rows: [] };
    let searchs = [];
    for (let s of data.search.split('|')) {
        searchs.push({
            Name: {
                [db.Op.like]: "%" + s + "%"
            }
        });
    }
    let favs = (await user.getFavorites()).map((i) => i.Id);
    let query  ={
        attributes: {
            include: [
                [db.sqlze.literal("REPLACE(Name, '[','0')"), 'N'],
                [db.sqlze.literal("(Select LastPos from RecentFiles where FileId == File.Id and RecentId == '" +
                    user.Recent.Id + "')"), "CurrentPos"],
                [db.sqlze.literal("(Select LastRead from RecentFiles where FileId == File.Id and RecentId == '" +
                    user.Recent.Id + "')"), "LastRead"]
            ]
        },
        order,
        include: [{
            model,
            where: {
                Id: data.id
            }
        }],
        offset: data.begin,
        limit: data.itemsPerPage,
        where: {
            [db.Op.or]: searchs
        }
    }
    
    if(model !== db.favorite) query.attributes.include.push([db.sqlze.literal(
        "(Select FileId from FavoriteFiles where FileId == File.Id and FavoriteId IN ('" + favs.join(
            "','") + "'))"), "isFav"]);

    files = await db.file.findAndCountAll(query);
    files.rows = files.rows.map(f => {
        let d = f.dataValues;
        return {
            Id: d.Id,
            Name: d.Name,
            Duration: d.Duration,
            Type: d.Type,
            isFav: d.isFav,
            CurrentPos: d.CurrentPos,
            DirectoryId: d.DirectoryId,
            LastRead: d.LastRead
        };
    });
    return files;
}