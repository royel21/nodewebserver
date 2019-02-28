const passport = require('passport');
const db = require('../models')

const mypassport = require('../passport_config')(passport);

exports.index = (req, res) => {
    if (req.user) {
        let itemsPerPage = req.params.items || req.query.items || 24;
        let currentPage = req.params.page || 1;
        let begin = ((currentPage - 1) * itemsPerPage);
        let val = req.params.search || "";
        
        db.video.findAndCountAll({
            order: ['Name'],
            offset: begin,
            limit: itemsPerPage,
            where: {
                Name: {
                    [db.Op.like]: "%" + val + "%"
                }
            }
        }).then(movies => {

            var totalPages = Math.ceil(movies.count / itemsPerPage);
            let view = req.query.partial ? "home/partial-items-view" : "home/index.pug";
            res.render(view, {
                title: "Home",
                movies,
                pagedatas: {
                    currentPage,
                    itemsPerPage,
                    totalPages,
                    search: val,
                    action: "/home/",
                    csrfToken: req.csrfToken()
                }
            }, (err, html) => {
                
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

exports.postSearch = (req, res) =>{
    let itemsPerPage = req.body.items || 10;
    let val = req.body.search || "";
    res.redirect(`/home/1/${itemsPerPage}/${val}?partial=true`)
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