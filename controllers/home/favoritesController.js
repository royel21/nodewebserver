const db = require('../../models');

var getFavoriteFiles = async(user, data) => {

    console.time("rc");
    files = { count: 0, rows: [] };
    if (user.Role.includes('admin')) return files;

    let favorite = await user.getFavorite();
    files.rows = await favorite.getFiles({
        attributes: {
            include: [
                'Id', 'Name', 'DirectoryId', 'Type', 'Duration', [db.sqlze.literal("REPLACE(Name, '[','0')"), 'N'],
                [db.sqlze.literal("(Select LastPos from RecentFiles where FileId == File.Id and RecentId == '" + user.Recent.Id + "')"), "CurrentPos"]
            ]
        },
        order: [
            [db.sqlze.col('N')]
        ],
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
    files.count = await db.favoriteFile.count({ where: { FavoriteId: favorite.Id } });
    console.timeEnd("rc");
    return files;
}

exports.favorite = (req, res) => {

    let screenw = parseInt(req.cookies['screen-w']);
    let itemsPerPage = req.params.items || req.query.items || req.itemsPerPage;
    let currentPage = req.params.page || 1;
    let begin = ((currentPage - 1) * itemsPerPage) || 0;
    let search = req.params.search || "";

    getFavoriteFiles(req.user, { begin, itemsPerPage, search }).then(items => {
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