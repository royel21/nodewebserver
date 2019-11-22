
const windrive = require('win-explorer');
const path = require('path');
const fs = require('fs-extra');
const db = require('../models');
const { fork } = require('child_process');

exports.configs = (req, res, next) => {
    db.directory.findAll().then(directories => {
        let view = req.query.partial ? "admin/directories/partial-directories" : "admin/index.pug";

        res.render(view, {
            title: "Directories", directories,
            pagedatas: {
                action: "/admin/directories/",
                csrfToken: req.csrfToken()
            }
        }, (err, html) => {
            if(err) console.log(err);

            if (req.query.partial) {
                res.send({ url: req.url, data: html });

            } else {
                res.send(html);
            }
        });
    });
}

exports.folderContent = (req, res) => {

    let dir = "";
    if (req.body.path) {
        dir = path.join(req.body.path, req.body.folder);
    } else {
        dir = req.body.folder;
    }

    let folders = windrive.ListFiles(dir, [], { hidden: true, file: false, directory: true });
    return folders.length == 0 ? res.send("") : res.render('admin/directories/tree-node', { fpath: dir, folders });
}

exports.deletePath = (req, res) => {
    let id = req.body.id;
    db.directory.destroy({ where: { Id: id } }).then(deletePath => {
        if (deletePath > 0) {
            let coverPath = path.resolve('./public', 'covers', 'videos', 'folder-'+id);
            if (fs.existsSync(coverPath)) {
                const worker = fork('./workers/delete-worker.js');
                worker.send(coverPath);
            }
            res.send("ok");;
        } else {
            res.send("error");
        }
    }).catch(err => {
        if(err) console.log(err);
        res.send("error");
    });
}