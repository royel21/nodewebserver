const db = require('../../models');

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

    files = await db.file.findAndCountAll({
        attributes: {
            include: [
                [db.sqlze.literal("REPLACE(Name, '[','0')"), 'N'],
                [db.sqlze.literal("(Select FileId from FavoriteFiles where FileId == File.Id and FavoriteId == '" +
                    user.Favorite.Id + "')"), "isFav"],
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
    });
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