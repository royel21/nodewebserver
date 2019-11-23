const folders = require('./folders')

module.exports = (server, app) => {
    const io = require('socket.io')(server);

    const db = require('../models');
    
    const connections = {};
    io.on('connection', (socket) => {
        
        folders.setSocket(socket, db);

        if (app.locals.user && app.locals.user.Role.includes('admin')) {
            
            socket.on('load-disks', folders.diskLoader);

            socket.on("scan-dir", folders.diskScaner);

            socket.on('re-scan', folders.reScan);
        }
        
        socket.on('disconnect', (client) => {
            
            connections[socket.id] = null;
            delete connections[socket.Id]
        });
    });
}
