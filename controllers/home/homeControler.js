const passport = require('passport');
const db = require('../../models');
const { getOrderBy } = require('./file-helper');

const mypassport = require('../../passport_config')(passport);

var processIndex = async(req, res) => {
    console.time('home');
    let orderby = req.params.orderby || "nu";
    let isFile = /video|content/ig.test(req.url);

    let isManga = req.url.includes("manga");
    if (isManga) isFile = true;

    //Select the database
    let tempDb = isFile ? db.file : db.folder;
    //Screen config
    let screenw = parseInt(req.cookies['screen-w']);
    let itemsPerPage = parseInt(req.params.items || req.query.items) || req.itemsPerPage;
    //parameters
    let foldersId = req.params.folder;
    if (!db.folder.findOne({ where: { Id: foldersId } })) {
        foldersId = null;
    }

    let currentPage = parseInt(req.params.page) || 1;
    let begin = ((currentPage - 1) * itemsPerPage);
    let search = req.params.search || "";
    //query
    let searchs = [];
    for (let s of search.split('|')) {
        searchs.push({
            Name: {
                [db.Op.like]: "%" + s + "%"
            }
        });
    }

    let query = {
        order: getOrderBy(orderby),
        offset: begin,
        limit: itemsPerPage,
        attributes: {
            include: [
                [db.sqlze.fn('REPLACE', db.sqlze.col("Name"), '[', '0'), 'N']
            ]
        },
        where: {
            [db.Op.or]: searchs
        }
    }
    let action = isManga ? `/mangas/${orderby}/` : isFile ? `/videos/${orderby}/` : `/folders/${orderby}/`;

    if (isFile || foldersId) {
        let favs = (await req.user.getFavorites()).map((i) => i.Id);
        query.attributes.include[1] = [
            db.sqlze.literal("(Select FileId from FavoriteFiles where FileId == File.Id and FavoriteId IN ('" + favs.join(
                "','") + "'))"),
            "isFav"
        ];
        query.attributes.include[2] = [
            db.sqlze.literal("(Select LastPos from RecentFiles where FileId == File.Id and RecentId == '" + req.user.Recent
                .Id + "')"),
            "CurrentPos"
        ];
        if (foldersId) {
            action = `/folder-content/${orderby}/${foldersId}/`
            query.where.FolderId = foldersId;
        } else {
            query.where.Type = isManga ? "Manga" : "Video";
        }
    }

    let items = await tempDb.findAndCountAll(query);
    items.rows = items.rows.map(f => {
        return f.dataValues;
    });
    var totalPages = Math.ceil(items.count / itemsPerPage);
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
            action,
            csrfToken: req.csrfToken(),
            step: req.step
        },
        isFile
    }, (err, html) => {
        if (err) console.log(err);

        if (req.query.partial) {
            res.send({ url: req.url.replace('?partial=true', ''), data: html });

        } else {
            res.send(html);
        }
        console.timeEnd('home');
    });
}

exports.index = (req, res) => {
    processIndex(req, res).then((result) => {
        return result;
    }).catch(err => {
        console.log(err)
        return res.status(500).send('Internal Server Error');
    });
}

exports.postSearch = (req, res) => {
    let itemsPerPage = parseInt(req.body.items) || 1;
    let search = req.body.search || "";
    let orderby = req.body.orderby || "nu";

    let folderId = req.params.folder;
    let url = `/folders/${orderby}/1/${itemsPerPage}/${search}?partial=true`;

    if (/video|content|manga/ig.test(req.url)) {
        url = (folderId ? `/folder-content/${orderby}/${folderId}` : /mangas/ig.test(req.url) ? `/mangas/${orderby}` :
            `/videos/${orderby}`) + `/1/${itemsPerPage}/${search}?partial=true`;
    }
    res.redirect(url);
}

exports.login = (req, res) => {
    if (req.user) {
        return res.redirect('/');
    } else
        db.user.findAll({ order: ['Name'] }).then(users => {
            res.render("home/login.pug", { users, title: "Log in", csrfToken: req.csrfToken(), message: req.flash() });
        });
}

exports.loginPost = (req, res, next) => {
    let options = {
        maxAge: 1000 * 60 * 60 * 24, // would expire after 15 minutes
    }
    res.cookie('screen-w', req.body.screenw, options);
    passport.authenticate('local', {
        successRedirect: req.body.returnurl || '/',
        failureRedirect: "/login",
        failureFlash: true
    })(req, res, next);
}

exports.logout = (req, res) => {
    req.logout();
    req.session.destroy();
    res.redirect('/login');
}