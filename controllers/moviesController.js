
let db = require('../models');

exports.movies = (req, res) => {
    console.log("my params: ", req.param.page)
    let moviePerPage = 20;
    let page = 1;
    let begin = ((page - 1) * moviePerPage);
    let val = "";

    db.video.findAndCountAll({
        //order: ['Name'],
        offset: begin,
        limit: moviePerPage,
        where: {
            Name: {
                [db.Op.like]: "%" + val + "%"
            }
        }
    }).then(movies => {
        var numberOfPages = Math.ceil(movies.count / moviePerPage);
        res.render("admin/index.pug", { title: "Administrar Peliculas", movies });
    }).catch(err => {
        console.log(err)
        res.status(500).send('Internal Server Error');
    });
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
            res.render("admin/movie_form",
                {
                    movie, csrfToken: req.csrfToken(),
                    categories,
                    modalTitle: uid ? "Editar Pelicula" : "Agregar Pelicula"
                });
        });
    }).catch(err => {
        res.status(500).send('Internal Server Error');
    });
}


const createMovie = (req, res) => {
    console.log("creating");
    if (req.body.name === "" || req.body.name === undefined) {
        return res.send({ err: "Nombre no puede estar vacio" });
    }

    db.movie.create({
        Name: req.body.name
    }).then(newMovie => {

        res.render("admin/user-row", {
            id: newMovie.Id,
            name: newMovie.Name
        }, (err, html) => {
            res.send({ state: "create", name: newMovie.Name, data: html });
        });
    }).catch(err => {
        res.send({ state: "error", data: "Nombre de usuario en uso" });
    });
}

const updateMovie = (req, res) => {
    console.log("updating", req.body);
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

exports.testPost = (req, res) =>{
    console.log(req.body);
    res.send("ok");
}