const passport = require('passport');
const db = require('../models')

const mypassport = require('../passport_config')(passport);

exports.index = (req, res) => {
    let isVideoView = /video|content/ig.test(req.url);
    
    let tempDb = isVideoView ? db.video : db.serie;

    let screenw = parseInt(req.cookies['screen-w']);
    let itemsPerPage = req.params.items || req.query.items || (screenw < 1900 ? 21 : 27);
    let seriesId = req.params.serie
    let currentPage = req.params.page || 1;
    let begin = ((currentPage - 1) * itemsPerPage);
    let val = req.params.search || "";
    let condition = {
        order: isVideoView ? ["NameNormalize"] : ["name"],
        offset: begin,
        limit: itemsPerPage
    }
    let action = isVideoView ? "/videos/" : "/series/";
    if (seriesId) {

        action = "/serie-content/" + seriesId + "/"
        condition.where = {
            [db.Op.and]: [{ Name: { [db.Op.like]: "%" + val + "%" } }, { SerieId: seriesId }]
        }
    } else {
        condition.where = { Name: { [db.Op.like]: "%" + val + "%" } }
    }

    tempDb.findAndCountAll(condition).then(items => {
        var totalPages = Math.ceil(items.count / itemsPerPage);
        let view = req.query.partial ? "home/partial-items-view" : "home/index.pug";
        res.render(view, {
            title: "Home Server",
            items,
            pagedatas: {
                currentPage,
                itemsPerPage,
                totalPages,
                search: val,
                action,
                csrfToken: req.csrfToken(),
                step: (screenw < 1900 ? 7 : 9)
            },
            isVideoView
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
    let val = req.body.search || "";

    let serieId = req.params.serie;
    let url = `/series/1/${itemsPerPage}/${val}?partial=true`;

    if(/video|content/ig.test(req.url)){
        url = (serieId ? `/serie-content/${serieId}` : '/videos') + `/1/${itemsPerPage}/${val}?partial=true`;
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