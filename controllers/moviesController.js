
let db = require('../models');

exports.movies = (req, res) => {
    console.log("my params: ", req.param.page)
    let moviePerPage = 20;
    let page =  1;
    let begin = ((page - 1) * moviePerPage);
    let val =  "";

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
        res.render("admin/movie_form",
            {
                movie, csrfToken: req.csrfToken(),
                modalTitle: uid ? "Editar Pelicula" : "Agregar Pelicula"
            });
    }).catch(err => {
        res.status(500).send('Internal Server Error');
    });
}