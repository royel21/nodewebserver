
module.exports = (server, app) => {

    const io = require('socket.io')(server)
    const { fork } = require('child_process');
    const drivelist = require('drivelist');
    const fs = require('fs-extra');
    const path = require('path');
    const pug = require('pug');

    const db = require('./models');

    const configPath = './config/server-config.json';

    const getNewId = async () => {
        let id = Math.random().toString(36).slice(-5);
        db.directory.findOne({ where: { Id: id } }).then(dir => {
            if (!dir) {
                return id;
            } else {
                return getNewId();
            }
        });
    }

    const startWork = (directory) => {

        const worker = fork('./workers/folder-scan.js');

        worker.send({id:directory.Id, dir: directory.FullPath});

        worker.on("message", (data) => {
            io.sockets.emit("scan-finish", data);
            directory.update({IsLoading: false});
            console.log(data)
            console.log("finish");
        });
        worker.on('close', function (code) {
            console.log('closing code: ' + code);
        });
    }

    var clients = {};

    io.on('connection', (socket) => {
        console.log("connected:" + socket.id, app.locals.user ? app.locals.user.Name : "");
        clients[socket.id] = socket;

        socket.on('load-disks', (client) => {
            drivelist.list((error, drives) => {
                if (error) return next(createError(500));

                let disks = [];
                if (drives) {
                    for (let disk of drives) {
                        disks.push(disk.mountpoints[0].path);
                    }
                }
                disks.sort();
                let renderTree = pug.compileFile('./views/admin/configs/tree-view.pug');
                socket.emit('disk-loaded', renderTree({ disks }));
            });
        });

        socket.on("scan-dir", (data) => {
            //If is it root of disk return;
            if (["c:\\", "C:\\", "/"].includes(data.folder))
                return socket.emit("path-added", false);

            let dir = path.join(data.path || "", data.folder);

            if (fs.existsSync(dir)) {
                getNewId(configs.paths).then(id => {
                    let id = getNewId(configs.paths);
                    db.directory.create({ Id: id, FullPath: dir, IsLoading: true }).then(newDir => {
                        if (newDir) {
                            let renderTree = pug.compileFile('./views/admin/configs/path-item.pug');
                            socket.emit("path-added", renderTree(newDir));
                            startWork(newDir);
                        }
                    }).catch(err => {
                        socket.emit("path-added", false);
                    });
                });
            } else {
                socket.emit("path-added", false);
            }
        });

        socket.on('re-scan', (data) => {
            db.directory.findOne({ where: { Id: id } }).then(dir=>{
                if(dir)
                {
                    startWork(dir);
                }else{
                    io.sockets.emit("scan-finish", data);
                }
            });
        });

        socket.on('disconnect', (client) => {
            delete clients[socket.id];
            console.log("disconected:" + socket.id);
        });
    });
}
