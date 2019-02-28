
const windrive = require('win-explorer');
const path = require('path');
const fs = require('fs-extra');
const db = require('../models');
const { fork } = require('child_process');

const configPath = './config/server-config.json';


exports.configs = (req, res, next) => {
    const configs = fs.readJsonSync(configPath);
    let view = req.query.partial ? "admin/configs/partial-configs" : "admin/index.pug";
    res.render(view, {
        title: "Configuraciones", configs, pagedatas: {
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

exports.AddPath = (req, res) => {
    let dir = "";
    if (req.body.path) {
        dir = path.join(req.body.path, req.body.folder);
    } else {
        dir = req.body.folder;
    }

    if (fs.existsSync(dir) && !configs.paths.includes(dir)) {
        configs.paths.push(dir);
        fs.writeJSONSync(configPath, configs);
        res.render('admin/configs/path-item', { path: dir, id: configs.paths.length - 1 });
    } else {
        res.send("");
    }
}

exports.deletePath = (req, res) => {
    let id = req.body.id;
    const configs = fs.readJsonSync(configPath);
    let pathToDelete = configs.paths.find(o => o.id === id);
    if (pathToDelete) {
        db.video.destroy({
            where: {
                FolderId: id
            }
        }).then((v) => {
            console.log("delete: ", v);
            let index = configs.paths.indexOf(pathToDelete);
            configs.paths.splice(index, 1);
            fs.writeJSONSync(configPath, configs);
            res.send("ok");
            let coverPath = path.join(__dirname,'static', 'covers', id);
            console.log(coverPath);
            if(fs.existsSync(coverPath)){
                const worker = fork('../workers/delete-worker.js');
                worker.send(coverPath);
                worker.on('finish',(result)=>{
                    console.log('result:',result);
                });
                worker.on('close', function(code) {
                    console.log('closing code: ' + code);
                });
                
            }

        }).catch(err => {
            res.send("error");
        });
    } else {
        res.send("error");
    }
}