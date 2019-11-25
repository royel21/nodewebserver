const StreamZip = require('node-stream-zip')
const path = require('path');
const fs = require('fs-extra');
var db;
var zips = {};
var lastId = "";


module.exports.removeZip = (id) => {

}

module.exports.setSocket = (_db) => {
    db = _db;
}

module.exports.loadZipImages = (data, socket) => {
    let zip;
    let entries;
    if (lastId === data.id) {
        zip = zips[data.id].zip;
        entries = zips[data.id].entries;
    }

    if (zip && entries) {
        for (let i = data.page; i < (data.page+10) && i < zips[data.id].entries.length; i++) {
            socket.emit('loaded-zipedimage', { page: i, img: zip.entryDataSync(entries[i]).toString('base64') });
        }
    }
    else {

        if (zips[data.id] && zips[data.id].zip) {
            zips[data.id].zip.close();
            delete zips[data.id].zip;
            delete zips[data.id].entries;
        } else {
            zips[data.id] = {};
        }

        lastId = data.id;
        db.file.findOne({ where: { Id: data.id } }).then(file => {
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
                        }).filter((entry)=>{ return !entry.isDirectory});

                        zips[data.id].entries = entries;
                        zips[data.id].zip = zip;
                        

                        for (let i = data.page; i < (data.page+10) && i < zips[data.id].entries.length; i++) {
                            console.log(entries[i]);
                            socket.emit('loaded-zipedimage', { total: entries.length, page: i, img: zip.entryDataSync(entries[i]).toString('base64') });
                            console.log('data send')
                        }
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