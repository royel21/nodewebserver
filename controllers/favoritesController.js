const db = require('../models');

var getFavoriteFiles = async (user, data) => {
    let fav = await user.getFavorite();
    let files = { count: 0, rows: [] };
    if (fav) {
        files = await db.file.findAndCountAll({
            atributtes: ['Id', 'Name'],
            order: ['Name'],
            offset: data.begin,
            limit: data.itemsPerPage,
            where: {
                [db.Op.and]: [{
                    Name: {
                        [db.Op.like]: "%" + data.search + "%"
                    }
                }, db.sqlze.literal(`File.Id IN (Select FileId from FavoriteFiles where FavoriteId = '${fav.Id}')`)]
            }
        });
    }
    return files;
}

exports.favorite = (req, res) => {

    let screenw = parseInt(req.cookies['screen-w']);
    let itemsPerPage = req.params.items || req.query.items || screenw > 1900 ? 21 : 27;
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
                step: (screenw < 1900 ? 7 : 9)
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
    let itemsPerPage = req.body.items;
    let search = req.body.search || "";

    res.redirect(`/favorites/1/${itemsPerPage}/${search}?partial=true`);
}

exports.postFavorite = (req, res) => {
    db.favoriteFile.findOrCreate({
        where:
            { FileId: req.body.id, FavoriteId: req.user.Favorite.Id }
    }).then(file => {
        return res.send({ result: file[1] ? true : false });
    }).catch(err => {
        console.log('fav-error', err);
        return res.send({ result: false });
    });
}

var removeFile = async (user, id) => {
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