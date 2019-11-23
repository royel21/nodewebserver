
const { fork } = require('child_process');
const drivelist = require('drivelist');
const fs = require('fs-extra');
const path = require('path');
const pug = require('pug');

var scanning = false;
var socket;
var db;

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

module.exports.setSocket = (_socket, _db) => {
    socket = _socket;
    db = _db;
}

module.exports.diskLoader = (client) => {

    drivelist.list().then(drives => {
        let disks = [];
        drives.forEach((drive) => {
            if (drive) {
                if (drive.mountpoints.length > 0)
                    disks.push(drive.mountpoints[0].path);
            }
        });
        disks.sort();
        let renderTree = pug.compileFile('./views/admin/directories/tree-view.pug');
        socket.emit('disk-loaded', renderTree({ disks }));
    });
}

module.exports.diskScaner = (data) => {
    //If is it root of disk return;
    if (scanning) return;
    scanning = true;
    if (["c:\\", "C:\\", "/"].includes(data.folder))
        return socket.emit("path-added", false);

    let dir = path.join(data.path || "", data.folder);

    if (fs.existsSync(dir)) {
        getNewId().then(id => {
            db.directory.create({ Id: id, FullPath: dir, IsLoading: true }).then(newDir => {
                if (newDir) {
                    let renderTree = pug.compileFile('./views/admin/directories/path-item.pug');
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
}

module.exports.reScan = (data) => {

    if (scanning) return;

    db.directory.findOne({ where: { Id: data.id } }).then(dir => {
        if (dir) {
            dir.update({ IsLoading: true });
            scanning = true;
            startWork(dir);

        } else {
            io.sockets.emit("scan-finish", data);
        }
    }).catch(err => {
        console.log(err)
    });
}