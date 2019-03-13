
let db = require('../models');
const { fork } = require('child_process');
const path = require('path');
const fs = require('fs-extra')

exports.movies = (req, res) => {
    let itemsPerPage = req.params.items || req.query.items || 12;
    let currentPage = req.params.page || 1;
    let begin = ((currentPage - 1) * itemsPerPage);
    let val = req.params.search || "";

    db.video.findAndCountAll({
        order: ['NameNormalize'],
        offset: begin,
        limit: itemsPerPage,
        where: {
            Name: {
                [db.Op.like]: "%" + val + "%"
            }
        }
    }).then(movies => {

        var totalPages = Math.ceil(movies.count / itemsPerPage);
        let view = req.query.partial ? "admin/movies/partial-movies-table" : "admin/index.pug";
        res.render(view, {
            title: "Peliculas",
            movies,
            pagedatas: {
                currentPage,
                itemsPerPage,
                totalPages,
                search: val,
                action: "/admin/movies/",
                csrfToken: req.csrfToken()
            }
        }, (err, html) => {
            if (err) console.log(err);
            if (req.query.partial) {
                res.send({ url: "/admin" + req.url, data: html });

            } else {
                res.send(html);
            }
        });
    }).catch(err => {
        if (err) console.log(err);
        res.status(500).send('Internal Server Error');
    });
}

exports.postSearch = (req, res) => {
    let itemsPerPage = req.body.items || 12;
    let currentPage = req.body.page || 1;
    let val = req.body.search || "";
    res.redirect(`/admin/movies/${currentPage}/${itemsPerPage}/${val}?partial=true`)
}

exports.movie_modal = (req, res) => {
    var uid = req.query.uid;
    if (uid) {
        db.video.findOne({
            where: {
                Id: uid
            }
        }).then(data => {
            let movie = data ? data : {};
            res.render("admin/movies/modal",
                {
                    movie, csrfToken: req.csrfToken(),
                    modalTitle: uid ? "Editar Pelicula" : "Agregar Pelicula"
                });
        }).catch(err => {
            if (err) console.log(err);
            res.status(500).send('Internal Server Error');
        });
    } else {
        res.send({ state: "error", msg: "Id Nulo" });
    }
}


exports.movieModalPost = (req, res) => {
    let Name = req.body.name;
    let Description = req.body.description;
    let Id = req.body.id;
    if (Id && Name && Name.length > 0) {
        db.video.findOne({ where: { Id } }).then(video => {
            let originalFile = path.join(video.FullPath, video.Name);
            video.update(
                { Name, Description }
            ).then((result) => {
                let toFile = path.join(video.FullPath, Name);
                console.log(originalFile, toFile);
                fs.move(originalFile, toFile);
                res.send({ state: "ok", Id, Name });
            });
        }).catch(err => {
            console.log(err)
            res.send({ state: "error", data: "Error Interno del servidor" });
        });
    } else {
        res.send({ state: "error", msg: "Nombre no puede estar vacio" });
    }
}

exports.deleteVideo = (req, res) => {
    let id = req.body.id;
    let fid = req.body.fid;
    let name = req.body.name;
    if (id) {
        db.video.findOne({ where: { Id: id } }).then(video => {
            video.destroy().then(() => {
                fs.removeSync(path.join('./static/covers', 'folder-' + video.DirectoryId, video.Id + ".jpg"));
                res.send({ state: "ok", msg: "Video Borrado" });
            });
        }).catch(err => {
            console.log(err)
            res.send({ state: "err", msg: "Error interno" });
        });
    } else {
        res.send({ state: "error", msg: "Id nulo" });
    }
}