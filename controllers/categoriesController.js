
let db = require('../models');

exports.categories = (req, res) => {
    console.log("my params: ", req.params)
    let itemsPerPage = req.params.items || req.query.items || 10;
    let currentPage = req.params.page || 1;
    let begin = ((currentPage - 1) * itemsPerPage);
    let val = "";
    db.category.findAndCountAll({
        order: ['Name'],
        offset: begin,
        limit: itemsPerPage,
        where: {
            Name: {
                [db.Op.like]: "%" + val + "%"
            }
        }
    }).then(categories => {
        let totalPages = Math.ceil(categories.count / itemsPerPage);
        let view = req.query.partial ? "admin/categories/partial-categories-table" : "admin/index.pug"; 
        res.render(view, { 
            title: "Categorias", 
            categories, 
            pagedatas: {
                currentPage,
                itemsPerPage,
                totalPages,
                search: val,
                action:"/admin/categories/",
                csrfToken: req.csrfToken()
            }
        });
    }).catch(err => {
        console.log(err)
        res.status(500).send('Internal Server Error');
    });
}


exports.postSearch = (req, res) =>{
    let itemsPerPage = req.body.items || 10;
    let currentPage = req.body.page || 1;
    let val = req.body.search || "";
    res.redirect(`/admin/categories/${currentPage}/${itemsPerPage}/${val}?partial=true`)
}

exports.category_modal = (req, res) => {
    var uid = req.query.uid;
    db.category.findOne({
        where: {
            Id: uid
        }
    }).then(data => {
        let category = data ? data : {};
        res.render("admin/categories/category_form",
            {
                category,
                csrfToken: req.csrfToken(),
                modalTitle: uid ? "Editar Categoria" : "Agregar Categoria"
            });
    }).catch(err => {
        res.status(500).send('Internal Server Error');
    });
}

const sendPostResponse = (res, action, state, category) =>{
    return res.render("admin/categories/category-row", {category}, (err, html) => {
        console.log(html)
        res.send({ action, state, name: category.Name, data: html });
    });
}

const createCategory = (req, res) => {
    console.log("creating");
    if (req.body.name === "" || req.body.name === undefined) {
        return res.send({ err: "Nombre no puede estar vacio" });
    }

    db.category.create({
        Name: req.body.name
    }).then(category => {
        sendPostResponse(res, "Categoria", "create", category);
    }).catch(err => {
        res.send({ state: "error", data: "Nombre de Categoria en uso" });
    });
}

const updateCategory = (req, res) => {
    console.log("updating", req.body);
    db.category.findOne({
        where: { Id: req.body.id }
    }).then(category => {
        if (category) {
            category.update({
                Name: req.body.name
            }).then(updatedCategory => {
                sendPostResponse(res, "Categoria", "update", updatedCategory);
            });
        } else {
            res.send({ state: "error", data: "Categoria no encontrado" });
        }
    }).catch(err => {
        res.send({ state: "error", data: "Error Interno del servidor" });
    });
}

exports.categoryModalPost = (req, res) => {
    if (req.body.id === '') {
        createCategory(req, res);
    } else {
        updateCategory(req, res);
    }
}