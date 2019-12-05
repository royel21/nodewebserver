const folders = require('./folders')
const mloader = require('./manga-loader')

module.exports = (server, app) => {
    const io = require('socket.io')(server);

    const db = require('../models');

    io.on('connection', (socket) => {

        folders.setSocket(io, socket, db);
        mloader.setSocket(db);

        if (app.locals.user) {

            socket.on('load-disks', folders.diskLoader);

            socket.on("scan-dir", folders.diskScaner);

            socket.on('re-scan', folders.reScan);
        }

        socket.on('loadzip-image', (data) => mloader.loadZipImages(data, socket, app.locals.user));

        socket.on('disconnect', (client) => {
            mloader.removeZip(socket.id);
        });
    });
}