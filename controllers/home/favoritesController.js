const db = require('../../models');
const helper = require('./file-helper');

var getFavoriteFiles = async(user, data) => {

    console.time("rc");
    files = { count: 0, rows: [] };
    if (user.Role.includes('admin')) return files;

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
        order: [
            [db.sqlze.col('N')]
        ],
        include: [{
            model: db.favorite,
            where: {
                Id: user.Favorite.Id
            }
        }],
        offset: data.begin,
        limit: data.itemsPerPage,
        where: {
            [db.Op.and]: [{
                Name: {
                    [db.Op.like]: "%" + data.search + "%"
                }
            }]
        }
    });
    console.timeEnd("rc");
    return files;
}

exports.favorite = (req, res) => {
    console.time("fav")
    let itemsPerPage = req.params.items || req.query.items || req.itemsPerPage;
    let currentPage = req.params.page || 1;
    let begin = ((currentPage - 1) * itemsPerPage) || 0;
    let search = req.params.search || "";
    let order = [
        [db.sqlze.col('N')]
    ]
    helper.getFiles(req.user, {
        id: req.user.Favorite.Id,
        begin,
        itemsPerPage,
        search
    }, db.favorite, order).then(items => {
        var totalPages = Math.ceil(items.count / itemsPerPage);
        let view = req.query.partial ? "home/partial-items-view" : "home/index.pug";
        res.render(view, {
            title: "Home Server",
            items,
            pagedatas: {
                currentPage,
                itemsPerPage,
                totalPages,
                search: search,
                action: '/favorites/',
                csrfToken: req.csrfToken(),
                step: req.step
            },
            isFile: true
        }, (err, html) => {
            if (err) console.log(err);

            if (req.query.partial) {
                res.send({ url: req.url, data: html });
            } else {
                res.send(html);
            }
            console.timeEnd("fav")
        });

    }).catch(err => {
        console.log('fav-error', err);
    });
}

exports.postSearch = (req, res) => {
    let itemsPerPage = parseInt(req.body.items) || 1;
    let search = req.body.search || "";

    res.redirect(`/favorites/1/${itemsPerPage}/${search}?partial=true`);
}

exports.postFavorite = (req, res) => {
    db.favoriteFile.findOrCreate({
        where: { FileId: req.body.id, FavoriteId: req.user.Favorite.Id }
    }).then(file => {
        return res.send({ result: file[1] ? true : false });
    }).catch(err => {
        console.log('fav-error', err);
        return res.send({ result: false });
    });
}

var removeFile = async(user, id) => {
    let file = await db.file.findOne({ where: { Id: id } });
    if (file) {
        await user.Favorite.removeFile(file);
        return true;
    }
    return false;
}

exports.postRemoveFile = (req, res) => {

    removeFile(req.user, req.body.id).then((result) => {
        res.send({ result });
    }).catch(err => {
        console.log('fav-error', err);
    });
}