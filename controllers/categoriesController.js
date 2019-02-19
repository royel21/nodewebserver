
let db = require('../models');

exports.categories = (req, res) => {
    console.log("my params: ", req.param.page)
    let categoryPerPage = 20;
    let page =  1;
    let begin = ((page - 1) * categoryPerPage);
    let val =  "";

    db.category.findAndCountAll({
        //order: ['Name'],
        offset: begin,
        limit: categoryPerPage,
        where: {
            Name: {
                [db.Op.like]: "%" + val + "%"
            }
        }
    }).then(categories => {
        var numberOfPages = Math.ceil(categories.count / categoryPerPage);
        res.render("admin/index.pug", { title: "Administrar Categorias", categories });
    }).catch(err => {
        console.log(err)
        res.status(500).send('Internal Server Error');
    });
}

exports.category_modal = (req, res) => {
    var uid = req.query.uid;
    db.category.findOne({
        where: {
            Id: uid
        }
    }).then(data => {
        let category = data ? data : {};
        res.render("admin/category_form",
            {
                category, csrfToken: req.csrfToken(),
                modalTitle: uid ? "Editar Pelicula" : "Agregar Pelicula"
            });
    }).catch(err => {
        res.status(500).send('Internal Server Error');
    });
}