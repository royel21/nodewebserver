const db = require('../models');
const fs = require('fs-extra');
const sharp = require('sharp')

const coverPath = './public/covers/series/';


exports.modal = (req, res) => {
    const isSerie = req.url.includes('series');
    let tempDB = isSerie ? db.serie : db.category;

    let Id = req.query.uid;
    let modalTitle = Id ? (isSerie ? "Editar Serie" : "Editar Categoria") : (isSerie ? "Nueva Serie" : "Nueva Categoria");

    tempDB.findOne({ where: { Id } }).then(item => {
        res.render('admin/item-modal', {
            item,
            csrfToken: req.csrfToken(),
            modalTitle,
            isSerie
        });
    }).catch(err => {
        if (err) console.log(err);
        res.status(500).send('Internal Server Error');
    });

}

const createCover = (req, item) => {
    const files = req.files;
    if (files && files.cover) {
        sharp(files.cover.data).resize(200).toFile(coverPath + `${item.Id}.jpg`);
    }
}

createItem = (req, res) => {
    const isSerie = req.url.includes('series')

    const name = req.body.name;
    let tempDB = isSerie ? db.serie : db.category;
    tempDB.create({ Name: name }).then(item => {
        if (item) {
            if (isSerie) createCover(req, item);
            res.render('admin/item-row', { item });
        } else
            res.send({ err: "500", message: err });
    }).catch(err => {
        if (err) console.log(err);
        res.send({ err: "500", message: err });
    });
}

editItem = (req, res) => {
    const isSerie = req.url.includes('series')

    const name = req.body.name;
    let tempDB = isSerie ? db.serie : db.category;
    let Id = req.body.id;
    
    if (isSerie) createCover(req, {Id});

    tempDB.update({ Name: name }, { where: { Id } }).then(item => {
        if (item) {
            res.render('admin/item-row', { item });
        } else
            res.send({ err: "500", message: "No se pudo actualizar el nombre" });
    }).catch(err => {
        if (err) console.log(err);
        res.send({ err: "500", message: err });
    });
}

exports.modalPost = (req, res) => {

    if (!req.body.id) {
        createItem(req, res);
    } else {
        editItem(req, res)
    }
}

exports.delete = (req, res) => {
    let id = req.body.itemId;
    let isSerie = req.url.includes('series');
    let tempDB = isSerie ? db.serie : db.category;
    console.log("Id:"+id, isSerie)
    tempDB.destroy({ where: { Id: id } }).then(result => {
        console.log(result)
        if (result > 0) {
            res.send({ state: "Ok", id });
            if (isSerie) {
                fs.remove(coverPath + id + '.jpg')
            }
        } else {
            res.status(500).send('Internal Server Error');
        }
    }).catch(err => {
        if (err) console.log(err);
        res.status(500).send('Internal Server Error');
    });
}
