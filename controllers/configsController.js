
const windrive = require('win-explorer')
const path = require('path')
const fs = require('fs-extra')

const configPath = './config/server-config.json'

const configs = fs.readJsonSync(configPath);

exports.configs = (req, res, next) => {
        
    let view = req.query.partial ? "admin/configs/partial-configs" : "admin/index.pug"; 
    res.render(view, {
        title: "Configuraciones", configs, pagedatas: {
            action: "/admin/configs/",
            csrfToken: req.csrfToken()
        }
    },(err, html) => {
        if(req.query.partial){
            res.send({ url: req.url, data: html });

        }else{
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
    let dir = req.body.path;
    if (configs.paths.includes(dir)) {
        let index = configs.paths.indexOf(dir);
        configs.paths.splice(index, 1);
        fs.writeJSONSync(configPath, configs);
        res.send("ok");
    } else {
        res.send("error");
    }
}