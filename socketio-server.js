module.exports = (server, app) => {

    const io = require('socket.io')(server)
    const { fork } = require('child_process');
    const drivelist = require('drivelist');
    const fs = require('fs-extra');
    const path = require('path');
    const pug = require('pug');

    const configPath = './config/server-config.json';

    var clients = {}
    io.on('connection', (socket) => {
        console.log("Id:" + socket.id, app.locals.user ? app.locals.user.Name : "");
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
            const configs = fs.readJsonSync(configPath);
            let dir = path.join(data.path || "", data.folder);
            let id;
            if (fs.existsSync(dir) && !configs.paths.includes(dir)) {
                configs.paths.push(dir);
                fs.writeJSONSync(configPath, configs);
                id = configs.paths.length - 1;
                let renderTree = pug.compileFile('./views/admin/configs/path-item.pug', { path: dir, id });
                socket.emit("path-added", renderTree({ path: dir, id: configs.paths.length - 1 }));
            } else {
                socket.emit("path-added", false);
            }

            const worker = fork('./workers/folder-scan.js');
            
            worker.send({dir, id});
            worker.on("message",(data)=>{
                socket.emit("scan-finish", data);
                console.log("finish");
            });
        });

        socket.on('disconnect', (client) => {
            delete clients[socket.id];
            console.log("disconect:" + socket.id);
        });
    });

}
