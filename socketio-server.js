module.exports = (server, app) => {
    
    const io = require('socket.io')(server)
    const drivelist = require('drivelist');
    const pug = require('pug');

    io.on('connection', (socket) => {
        console.log("Id:"+socket.id, app.locals.user ? app.locals.user.Name : "");
        socket.on('load-disks', (client)=>{
            console.log('loading disk',app.locals.user.Name);
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
                socket.emit('disk-loaded', renderTree({disks}));
            });
        });
    }); 
}
