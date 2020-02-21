const db = require('../../models');
const helper = require('./file-helper');

var loadFavorities = async (req, res) => {
    console.time("fav")
    let currentFav = req.params.list;
    let orderby = req.params.orderby || "nu";

    let search = req.params.search || "";
    let itemsPerPage = parseInt(req.params.items || req.query.items) || req.itemsPerPage;
    let currentPage = parseInt(req.params.page) || 1;
    let begin = ((currentPage - 1) * itemsPerPage);

    let favorites = await req.user.getFavorites({ order: ['Name'] });
    let items = { count: 0, rows: [] };
    if (favorites.length > 0) {
        let fav = favorites.find((c) => { return c.Name.includes(currentFav) }) || favorites[0];

        items = await helper.getFiles(req.user, { id: fav.Id, begin, itemsPerPage, search },
            db.favorite, helper.getOrderBy(orderby)
        );

        currentFav = fav.Name;
    }

    let totalPages = Math.ceil(items.count / itemsPerPage);
    let view = req.query.partial ? "home/partial-items-view" : "home/index.pug";

    return res.render(view, {
        title: "Home Server",
        items,
        pagedatas: {
            orderby,
            currentPage,
            itemsPerPage,
            totalPages,
            search: search,
            action: `/favorites/${orderby}/${currentFav}/`,
            csrfToken: req.csrfToken(),
            step: req.step,
            list: currentFav
        },
        isFile: true,
        itemList: favorites
    }, (err, html) => {
        if (err) console.log(err);

        if (req.query.partial) {
            res.send({ url: `/favorites/${orderby}/${currentFav}/`, data: html });
        } else {
            res.send(html);
        }
        console.timeEnd("fav");
    });
}

exports.favorite = (req, res) => {
    loadFavorities(req, res).catch(err => {
        if (err) console.log(err);
        res.status(500).send('Internal Server Error');
    });
}

exports.postSearch = (req, res) => {
    let itemsPerPage = parseInt(req.body.items) || 1;
    let orderby = req.params.orderby || "nu";
    let search = req.body.search || "";
    let fav = req.body.list;
    let url = `/favorites/${orderby}/`;

    if (fav) {
        return res.redirect(url + `${fav}/1/${itemsPerPage}/${search}?partial=true`);
    } else {
        db.favorite.findOne({ order: ['Name'] }).then(favorite => {

            if (favorite) {
                url += favorite.Name + `/1/${itemsPerPage}/${search}?partial=true`;
            }
            console.log('favorite:', url);
            return res.redirect(url);
        });
    }
}

exports.favoriteList = (req, res) => {
    req.user.getFavorites({ order: ['Name'] }).then(favs => {

        let favorities = favs.map(f => { return { id: f.Id, name: f.Name } });
        console.log(favorities)
        res.send(favorities);
    }).catch(err => {
        res.send({ result: false });
    });
}

exports.postFavorite = (req, res) => {
    db.favoriteFile.findOrCreate({
        where: { FileId: req.body.itemId, FavoriteId: req.body.favId }
    }).then(file => {
        return res.send({ result: file[1] ? true : false });
    }).catch(err => {
        console.log('fav-error', err);
        return res.send({ result: false });
    });
}

exports.postFavoriteFile = (req, res) => {

    db.favoriteFile.findOrCreate({
        where: { FileId: req.body.id, FavoriteId: req.user.Favorite.Id }
    }).then(file => {
        return res.send({ result: file[1] ? true : false });
    }).catch(err => {
        console.log('fav-error', err);
        return res.send({ result: false });
    });
}

exports.postRemoveFile = (req, res) => {
    console.log(req.body)
    db.favoriteFile.destroy({
        where: { FileId: req.body.itemId, FavoriteId: req.body.favId }
    }).then(result => {
        console.log(result)
       res.send({ result: (result > 0) });
    }).catch(err => {
        res.send({ result: false });
        console.log('fav-error', err);
    });
}