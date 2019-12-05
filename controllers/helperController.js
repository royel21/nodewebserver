const db = require('../models');
const fs = require('fs-extra');
const sharp = require('sharp')

const coverPath = './public/covers/folders/';


exports.modal = (req, res) => {
    const isFolder = req.url.includes('folders');
    let tempDB = isFolder ? db.folder : db.category;

    let Id = req.query.uid;
    let modalTitle = Id ? (isFolder ? "Editar Folder" : "Editar Categoria") : (isFolder ? "Nueva Folder" : "Nueva Categoria");

    tempDB.findOne({ where: { Id } }).then(item => {
        res.render('admin/item-modal', {
            item,
            csrfToken: req.csrfToken(),
            modalTitle,
            isFolder
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
    const isFolder = req.url.includes('folders')

    const name = req.body.name;
    let tempDB = isFolder ? db.folder : db.category;
    tempDB.create({ Name: name }).then(item => {
        if (item) {
            if (isFolder) createCover(req, item);
            res.render('admin/item-row', { item });
        } else
            res.send({ err: "500", message: err });
    }).catch(err => {
        if (err) console.log(err);
        res.send({ err: "500", message: err });
    });
}

editItem = (req, res) => {
    const isFolder = req.url.includes('folders')

    const name = req.body.name;
    let tempDB = isFolder ? db.folder : db.category;
    let Id = req.body.id;

    if (isFolder) createCover(req, { Id });

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
    let isFolder = req.url.includes('folders');
    let tempDB = isFolder ? db.folder : db.category;

    tempDB.destroy({ where: { Id: id } }).then(result => {

        if (result > 0) {
            res.send({ status: "Ok" });
            if (isFolder) {
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