
module.exports = (server, app) => {

    const io = require('socket.io')(server)
    const { fork } = require('child_process');
    const drivelist = require('drivelist');
    const fs = require('fs-extra');
    const path = require('path');
    const pug = require('pug');

    const db = require('./models');
    const connections = {};

    var scanning = false;
    const getNewId = async () => {
        let id = Math.random().toString(36).slice(-5);
        let dir = await db.directory.findOne({ where: { Id: id } })
        if (dir == null) {
            return id;
        } else {
            return getNewId();
        }
    }

    const startWork = (directory) => {

        const worker = fork('./workers/folder-scan.js');

        worker.send({ id: directory.Id, dir: directory.FullPath });

        worker.on("message", (data) => {
            io.sockets.emit("scan-finish", data);
            directory.update({ IsLoading: false });
            scanning = false;
        });
    }


    io.on('connection', (socket) => {
        if (app.locals.user && app.locals.user.Role.includes('admin')) {
            connections[socket.id];
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
                if(scanning) return;
                scanning = true;
                if (["c:\\", "C:\\", "/"].includes(data.folder))
                    return socket.emit("path-added", false);

                let dir = path.join(data.path || "", data.folder);

                if (fs.existsSync(dir)) {
                    getNewId().then(id => {
                        db.directory.create({ Id: id, FullPath: dir, IsLoading: true }).then(newDir => {
                            if (newDir) {
                                let renderTree = pug.compileFile('./views/admin/configs/path-item.pug');
                                socket.emit("path-added", renderTree(newDir));
                                startWork(newDir);
                            } else {
                                socket.emit("path-added", false);
                            }
                        }).catch(err => {
                            console.log(err);
                            socket.emit("path-added", false);
                        });
                    });
                } else {
                    socket.emit("path-added", false);
                }
            });

            socket.on('re-scan', (data) => {
                console.log(data)
                if(scanning) return;

                db.directory.findOne({ where: { Id: data.id } }).then(dir => {
                    if (dir) {
                        dir.update({ IsLoading: true });
                            scanning = true;
                        startWork(dir);
                        console.log("start scan")
                    } else {
                        io.sockets.emit("scan-finish", data);
                    }
                }).catch(err=>{
                    console.log(err)
                });
            });
        }
        socket.on('disconnect', (client) => {
            console.log(socket.id)
            connections[socket.id] = null;
            delete connections[socket.Id]
        });
    });
}
