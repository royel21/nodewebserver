const StreamZip = require('node-stream-zip')
const path = require('path');
const fs = require('fs-extra');
var db;
var users = {};
var lastId;

module.exports.removeZip = (id) => {
    delete users[id];
}

module.exports.setSocket = (_db) => {
    db = _db;
}

module.exports.loadZipImages = (data, socket) => {
    //get last user or create
    let user = users[socket.id] ? users[socket.id] : users[socket.id] = { lastId: "", zip: {}, entries: [] };

    if (user.lastId === data.id) {
        for (let i = data.page; i < (data.page + data.pagetoload) && i < user.entries.length; i++) {
            try {

                let data = user.zip.entryDataSync(user.entries[i]).toString('base64');

                socket.emit('loaded-zipedimage', {
                    page: i,
                    img: data
                });
            } catch (err) {
                console.log(err);
            }
        }
        socket.emit('loaded-zipedimage', { last: true });
    }
    else {

        user.lastId = data.id;

        db.file.findOne({ where: { Id: user.lastId } }).then(file => {
            if (file) {
                let filePath = path.resolve(file.FullPath, file.Name);
                console.log(filePath);
                if (fs.existsSync(filePath)) {
                    zip = new StreamZip({
                        file: path.resolve(file.FullPath, file.Name),
                        storeEntries: true
                    });

                    zip.on('ready', () => {
                        let entries = Object.values(zip.entries()).sort((a, b) => {
                            return String(a.name).localeCompare(String(b.name))
                        }).filter((entry) => { return !entry.isDirectory });

                        user.entries = entries;
                        user.zip = zip;


                        for (let i = data.page; i < (data.page + data.pagetoload) && i < entries.length; i++) {
                            socket.emit('loaded-zipedimage', {
                                total: entries.length,
                                page: i,
                                img: zip.entryDataSync(entries[i]).toString('base64')
                            });
                        }
                        socket.emit('loaded-zipedimage', { last: true });
                        console.log('data send')
                    });

                    zip.on('error', (err) => {
                        socket.emit('loaded-zipedimage', { error: 'some error' });
                        console.log(err)
                    });
                }
            }
        });
    }
}