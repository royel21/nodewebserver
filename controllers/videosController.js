
let db = require('../models');
const { fork } = require('child_process');
const path = require('path');

exports.movies = (req, res) => {
    let itemsPerPage = req.params.items || req.query.items || 12;
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
                res.send({ url: "/admin"+req.url, data: html });

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
    let itemsPerPage = req.body.items || 10;
    let currentPage = req.body.page || 1;
    let val = req.body.search || "";
    res.redirect(`/admin/movies/${currentPage}/${itemsPerPage}/${val}?partial=true`)
}

exports.movie_modal = (req, res) => {
    var uid = req.query.uid;
    db.video.findOne({
        where: {
            Id: uid
        }
    }).then(data => {
        let movie = data ? data : {};
        db.category.findAll({ order: ['Name'] }).then(ca => {
            var categories = ca ? ca : [];
            res.render("admin/movies/movie_form",
                {
                    movie, csrfToken: req.csrfToken(),
                    categories,
                    modalTitle: uid ? "Editar Pelicula" : "Agregar Pelicula"
                });
        });
    }).catch(err => {
        if (err) console.log(err);
        res.status(500).send('Internal Server Error');
    });
}


const createMovie = (req, res) => {
    if (req.body.name === "" || req.body.name === undefined) {
        return res.send({ err: "Nombre no puede estar vacio" });
    }

    db.movie.create({
        Name: req.body.name
    }).then(newMovie => {

        res.render("admin/movies/user-row", {
            id: newMovie.Id,
            name: newMovie.Name
        }, (err, html) => {
            if (err) console.log(err);
            res.send({ state: "create", name: newMovie.Name, data: html });
        });
    }).catch(err => {
        if (err) console.log(err);
        res.send({ state: "error", data: "Nombre de usuario en uso" });
    });
}

const updateMovie = (req, res) => {
    db.movie.findOne({
        where: { Id: req.body.id }
    }).then(movie_found => {

        if (movie_found) {
            movie_found.update({
                Name: req.body.name
            }).then(updatedMovie => {
                res.render("admin/user-row", {
                    id: category_found.Id,
                    name: updatedMovie.Name
                }, (err, html) => {
                    if (err) console.log(err);
                    res.send({ state: "update", name: updatedMovie.Name, data: html });
                });
            });

        } else {
            res.send({ state: "error", data: "Usuario no encontrado" });
        }
    }).catch(err => {
        res.send({ state: "error", data: "Error Interno del servidor" });
    });
}

exports.movieModalPost = (req, res) => {
    if (req.body.id === '') {
        createMovie(req, res);
    } else {
        updateMovie(req, res);
    }
}

exports.deleteVideo = (req, res) => {
    let id = req.body.id;
    let fid = req.body.fid;
    let name = req.body.name;
    if (id) {
        db.video.destroy({ where: { Id: id } })
            .then(wasDestroy => {
                if (wasDestroy > 0) {
                    const worker = fork('./workers/delete-worker.js');
                    worker.send(path.resolve('./static/covers', fid, name + ".jpg"));
                    res.send(true);
                } else {
                    res.send(false);
                }
            });
    } else {
        res.send(false);
    }
}