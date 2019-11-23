var socket;
var db

module.exports.setSocket = (_socket, _db) => {
    socket = _socket;
    db = _db;
}