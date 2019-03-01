
const windrive = require('win-explorer');
const path = require('path');
const fs = require('fs-extra');
const db = require('../models');
const { fork } = require('child_process');

exports.configs = (req, res, next) => {
    db.directory.findAll().then(directories => {
        let view = req.query.partial ? "admin/configs/partial-configs" : "admin/index.pug";

        res.render(view, {
            title: "Configuraciones", directories,
            pagedatas: {
                action: "/admin/configs/",
                csrfToken: req.csrfToken()
            }
        }, (err, html) => {

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

    let folders = windrive.ListFiles(dir, [], { hidden: false, file: false, directory: true });
    return folders.length == 0 ? res.send("") : res.render('admin/configs/tree-node', { fpath: dir, folders });
}

exports.deletePath = (req, res) => {
    let id = req.body.id;
    db.directory.destroy({ where: { Id: id } }).then(deletePath => {
        if (deletePath > 0) {
            // db.video.destroy({
            //     where: {
            //         FolderId: id
            //     }
            // }).then((v) => {
            //     let coverPath = path.resolve('./static', 'covers', id);
            //     if (fs.existsSync(coverPath)) {
            //         const worker = fork('./workers/delete-worker.js');
            //         worker.send(coverPath);
            //         worker.on('finish', (result) => {
            //             //console.log('result:', result);
            //         });
            //     }
            //     res.send("ok");
            // }).catch(err => {
            //     res.send("error");
            // })
            let coverPath = path.resolve('./static', 'covers', id);
            if (fs.existsSync(coverPath)) {
                const worker = fork('./workers/delete-worker.js');
                worker.send(coverPath);
                worker.on('finish', (result) => {
                    //console.log('result:', result);
                });
            }
            res.send("ok");;
        } else {
            res.send("error");
        }
    }).catch(err => {
        res.send("error");
    });
}