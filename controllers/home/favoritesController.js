const db = require('../../models');
const helper = require('./file-helper');


exports.favorite = (req, res) => {
    console.time("fav")
    let orderby = req.params.orderby || "nu";
    let itemsPerPage = req.params.items || req.query.items || req.itemsPerPage;
    let currentPage = req.params.page || 1;
    let begin = ((currentPage - 1) * itemsPerPage) || 0;
    let search = req.params.search || "";

    helper.getFiles(req.user, {
        id: req.user.Favorite.Id,
        begin,
        itemsPerPage,
        search
    }, db.favorite, helper.getOrderBy(orderby)).then(items => {
        var totalPages = Math.ceil(items.count / itemsPerPage);
        let view = req.query.partial ? "home/partial-items-view" : "home/index.pug";
        res.render(view, {
            title: "Home Server",
            items,
            pagedatas: {
                orderby,
                currentPage,
                itemsPerPage,
                totalPages,
                search: search,
                action: `/favorites/${orderby}/`,
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
    let orderby = req.body.orderby || "nu";
    let itemsPerPage = parseInt(req.body.items) || 1;
    let search = req.body.search || "";

    res.redirect(`/favorites/${orderby}/1/${itemsPerPage}/${search}?partial=true`);
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