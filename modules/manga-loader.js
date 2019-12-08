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

module.exports.loadZipImages = async(data, socket, currentUser) => {
    //get last user or create
    let user = users[socket.id] ? users[socket.id] : users[socket.id] = { lastId: "", zip: {}, entries: [] };

    if (user.lastId === data.id) {
        if (data.range) {
            for (let i of data.range) {
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
        } else {
            for (let i = data.page < 0 ? 0 : data.page; i < (data.page + data.pagetoload) && i < user.entries.length; i++) {
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
        }
        socket.emit('m-finish', { last: true });
    } else {

        user.lastId = data.id;
        db.file.findOne({
            attributes: ['FullPath', 'Name', [db.sqlze.literal("(Select LastPos from RecentFiles where FileId == File.Id and RecentId == '" + currentUser.Recent.Id + "')"), "CurrentPos"]],
            where: { Id: user.lastId }
        }).then(file => {
            if (file) {
                let filePath = path.resolve(file.FullPath, file.Name);
                if (fs.existsSync(filePath)) {
                    zip = new StreamZip({
                        file: path.resolve(file.FullPath, file.Name),
                        storeEntries: true
                    });
                    let page = file.dataValues.CurrentPos - 5;

                    zip.on('ready', () => {

                        let entries = Object.values(zip.entries()).sort((a, b) => {
                            return String(a.name).localeCompare(String(b.name))
                        }).filter((entry) => { return !entry.isDirectory });

                        user.entries = entries;
                        user.zip = zip;
                        socket.emit('m-info', { total: entries.length, name: file.Name, page: file.dataValues.CurrentPos || 0 });

                        for (let i = page < 0 ? 0 : page; i < (page + data.pagetoload) && i < entries.length; i++) {
                            socket.emit('loaded-zipedimage', {
                                page: i,
                                img: zip.entryDataSync(entries[i]).toString('base64')
                            });
                        }
                        socket.emit('m-finish', { last: true });
                        console.log('data send');
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