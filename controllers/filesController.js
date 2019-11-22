
let db = require('../models');
const { fork } = require('child_process');
const path = require('path');
const fs = require('fs-extra')
const { NormalizeName } = require('../Utils/StringUtil')

exports.files = (req, res) => {
    let itemsPerPage = req.params.items || req.query.items || 12;
    let currentPage = req.params.page || 1;
    let begin = ((currentPage - 1) * itemsPerPage);
    let val = req.params.search || "";

    db.file.findAndCountAll({
        order: ['NameNormalize'],
        offset: begin,
        limit: itemsPerPage,
        where: {
            Name: {
                [db.Op.like]: "%" + val + "%"
            }
        }
    }).then(files => {

        var totalPages = Math.ceil(files.count / itemsPerPage);
        let view = req.query.partial ? "admin/files/partial-files-table" : "admin/index.pug";
        res.render(view, {
            title: "Files",
            files,
            pagedatas: {
                currentPage,
                itemsPerPage,
                totalPages,
                search: val,
                action: "/admin/files/",
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
    res.redirect(`/admin/files/${currentPage}/${itemsPerPage}/${val}?partial=true`)
}

exports.file_modal = (req, res) => {
    var uid = req.query.uid;
    if (uid) {
        db.file.findOne({
            where: {
                Id: uid
            }
        }).then(data => {
            let file = data ? data : {};
            res.render("admin/files/modal",
                {
                    file, csrfToken: req.csrfToken(),
                    modalTitle: uid ? "Editar File" : "Agregar File"
                });
        }).catch(err => {
            if (err) console.log(err);
            res.status(500).send('Internal Server Error');
        });
    } else {
        res.send({ state: "error", msg: "Id Nulo" });
    }
}


exports.fileModalPost = (req, res) => {
    let Name = req.body.name;
    let Description = req.body.description;
    let Id = req.body.id;
    if (Id && Name && Name.length > 0) {
        db.file.findOne({ where: { Id } }).then(file => {
            let originalFile = path.join(file.FullPath, file.Name);
            file.update(
                { Name, Description, NameNormalize: NormalizeName(Name) }
            ).then((result) => {
                let toFile = path.join(file.FullPath, Name);
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

exports.deleteFile = (req, res) => {
    let id = req.body.id;
    let fid = req.body.fid;
    let name = req.body.name;
    if (id) {
        db.file.findOne({ where: { Id: id } }).then(file => {
            file.destroy().then(() => {
                fs.removeSync(path.join('./public/covers', 'folder-' + file.DirectoryId, file.Id + ".jpg"));
                res.send({ state: "ok", msg: "File Borrado" });
            });
        }).catch(err => {
            console.log(err)
            res.send({ state: "err", msg: "Error interno" });
        });
    } else {
        res.send({ state: "error", msg: "Id nulo" });
    }
}