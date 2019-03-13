const passport = require('passport');
const db = require('../models')

const mypassport = require('../passport_config')(passport);

exports.index = (req, res) => {
    if (req.user) {
        let itemsPerPage = req.params.items || req.query.items || (req.screenW < 1900 ? 12 : 24);
        let currentPage = req.params.page || 1;
        let begin = ((currentPage - 1) * itemsPerPage);
        let val = req.params.search || "";

        db.serie.findAndCountAll({
            order: ['Name'],
            offset: begin,
            limit: itemsPerPage,
            where: {
                Name: {
                    [db.Op.like]: "%" + val + "%"
                }
            }
        }).then(series => {
            console.log(series.rows.map(s=>s.Name));
            var totalPages = Math.ceil(series.count / itemsPerPage);
            let view = req.query.partial ? "home/partial-items-view" : "home/index.pug";
            res.render(view, {
                title: "Home",
                series,
                items: series,
                pagedatas: {
                    currentPage,
                    itemsPerPage,
                    totalPages,
                    search: val,
                    action: "/series/",
                    csrfToken: req.csrfToken()
                }
            }, (err, html) => {
                if(err) console.log(err);

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
    } else {
        return res.redirect('/login');
    }
}

exports.postSerieSearch = (req, res) => {
    let itemsPerPage = req.body.items || 10;
    let val = req.body.search || "";
    res.redirect(`/series/1/${itemsPerPage}/${val}?partial=true`)
}

exports.videos = (req, res) => {

        let itemsPerPage = req.params.items || req.query.items || (req.screenW < 1900 ? 12 : 24);
        let seriesId = req.params.serie
        let currentPage = req.params.page || 1;
        let begin = ((currentPage - 1) * itemsPerPage);
        let val = req.params.search || "";
        let condition = {
            order: ['Name'],
            offset: begin,
            limit: itemsPerPage
        }
        
        if(seriesId){
            condition.where = {
                [db.Op.and]:[{Name: { [db.Op.like]: "%" + val + "%" }}, {SerieId: seriesId}]
            }
        }else{
            condition.where = {Name: { [db.Op.like]: "%" + val + "%" }}
        }
        let action = seriesId ? "/serie-content/"+seriesId+"/" : "/videos/"
        db.video.findAndCountAll(condition).then(videos => {
            var totalPages = Math.ceil(videos.count / itemsPerPage);
            let view = req.query.partial ? "home/partial-items-view" : "home/index.pug";
            res.render(view, {
                title: "Home",
                videos,
                items: videos,
                pagedatas: {
                    currentPage,
                    itemsPerPage,
                    totalPages,
                    search: val,
                    action,
                    csrfToken: req.csrfToken()
                },
                isVideoView: true
            }, (err, html) => {
                if(err) console.log(err);

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

exports.postVideoSearch = (req, res) => {
    let itemsPerPage = req.body.items || 10;
    let serieId = req.params.serie;
    let val = req.body.search || "";
    let url = (serieId ? `/serie-content/${serieId}` :'/videos')+`/1/${itemsPerPage}/${val}?partial=true`;
    res.redirect(url);
}

exports.login = (req, res) => {
    if (req.user) {
        return res.redirect('/');
    } else
        res.render("home/login.pug", { title: "Log in", csrfToken: req.csrfToken(), message: req.flash() });
}

exports.loginPost = (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: "/",
        failureRedirect: "/login",
        failureFlash: true
    })(req, res, next);
}

exports.logout = (req, res, next) => {
    req.logout();
    req.session.destroy();
    res.redirect('/login');
}