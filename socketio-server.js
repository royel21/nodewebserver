module.exports = (server, app) => {
    
    const io = require('socket.io')(server)

    io.on('connection', (client) => {
        console.log('Client Connected', app.user);
    });
}
