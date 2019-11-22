const passport = require('passport');
const db = require('../models')

const mypassport = require('../passport_config')(passport);

exports.index = (req, res) => {
    let isFile = /video|content/ig.test(req.url);
    
    let isManga = req.url.includes("manga");
    if(isManga) isFile = true;

    //Select the database
    let tempDb = isFile ? db.file : db.serie;
    //Screen config
    let screenw = parseInt(req.cookies['screen-w']);
    let itemsPerPage = req.params.items || req.query.items || (screenw < 1900 ? 21 : 27);
    //parameters
    let seriesId = req.params.serie
    let currentPage = req.params.page || 1;
    let begin = ((currentPage - 1) * itemsPerPage);
    let search = req.params.search || "";
    //query
    let query = {
        order: isFile ? ["NameNormalize"] : ["name"],
        offset: begin,
        limit: itemsPerPage
    }

    let action = isManga ? "/mangas/" : isFile ? "/videos/" :  "/series/";

    if (seriesId) {

        action = "/serie-content/" + seriesId + "/"
        query.where = {
            [db.Op.and]: [{ Name: { [db.Op.like]: "%" + search + "%" } }, { SerieId: seriesId }]
        }
    } else {
        query.where = { Name: { [db.Op.like]: "%" + search + "%" } }
        
        if(isFile){
            query.where.Type = isManga ? "Manga" : "Video"
        }
    }

    tempDb.findAndCountAll(query).then(items => {
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
                action,
                csrfToken: req.csrfToken(),
                step: (screenw < 1900 ? 7 : 9)
            },
            isFile
        }, (err, html) => {
            if (err) console.log(err);

            if (req.query.partial) {
                res.send({ url: req.url, data: html });

            } else {
                res.send(html);
            }
        });
    }).catch(err => {
        console.log(err)
        res.status(500).send('Internal Server Error');
    });
}

exports.postSearch = (req, res) => {
    let itemsPerPage = req.body.items;
    let search = req.body.search || "";

    let serieId = req.params.serie;
    let url = `/series/1/${itemsPerPage}/${search}?partial=true`;

    if(/video|content|manga/ig.test(req.url)){
        url = (serieId ? `/serie-content/${serieId}` : /mangas/ig.test(req.url) ? "/mangas": '/videos') + `/1/${itemsPerPage}/${search}?partial=true`;
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

    let rediretTo = req.body.serieid === 'false' ? "/" : '/serie-content/' + req.body.serieid;

    passport.authenticate('local', {
        successRedirect: rediretTo,
        failureRedirect: "/login",
        failureFlash: true
    })(req, res, next);
}

exports.logout = (req, res) => {
    req.logout();
    req.session.destroy();
    res.redirect('/login');
}