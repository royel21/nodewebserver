const passport = require('passport');
const db = require('../../models');

const mypassport = require('../../passport_config')(passport);

var processIndex = async(req, res) => {
    console.time('home');
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

    let query = {
        order: db.sqlze.col('N'),
        offset: begin,
        limit: itemsPerPage,
        attributes: {
            include: [
                [db.sqlze.fn('REPLACE', db.sqlze.col("Name"), '[', '0'), 'N']
            ]
        },
        where: {
            Name: {
                [db.Op.like]: "%" + search + "%"
            }
        }
    }
    let action = isManga ? "/mangas/" : isFile ? "/videos/" : "/folders/";

    if (isFile || foldersId) {
        query.attributes.include[1] = [db.sqlze.literal(
            "(Select FileId from FavoriteFiles where FileId == File.Id and FavoriteId == '" + req.user.Favorite.Id +
            "')"), "isFav"];
        query.attributes.include[2] = [db.sqlze.literal(
                "(Select LastPos from RecentFiles where FileId == File.Id and RecentId == '" + req.user.Recent.Id + "')"),
            "CurrentPos"
        ];
        if (foldersId) {
            action = "/folder-content/" + foldersId + "/"
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
            res.send({ url: req.url, data: html });

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

    let folderId = req.params.folder;
    let url = `/folders/1/${itemsPerPage}/${search}?partial=true`;

    if (/video|content|manga/ig.test(req.url)) {
        url = (folderId ? `/folder-content/${folderId}` : /mangas/ig.test(req.url) ? "/mangas" : '/videos') +
            `/1/${itemsPerPage}/${search}?partial=true`;
    }

    res.redirect(url);
}

exports.login = (req, res) => {
    if (req.user) {
        return res.redirect('/');
    } else
        res.render("home/login.pug", { title: "Log in", csrfToken: req.csrfToken(), message: req.flash() });
}

exports.loginPost = (req, res, next) => {
    let options = {
        maxAge: 1000 * 60 * 60 * 24, // would expire after 15 minutes
    }
    res.cookie('screen-w', req.body.screenw, options);

    console.log(req.body)
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: "/login",
        failureFlash: true
    })(req, res, next);
}

exports.logout = (req, res) => {
    req.logout();
    req.session.destroy();
    res.redirect('/login');
}