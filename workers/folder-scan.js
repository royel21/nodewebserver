const WinDrive = require('win-explorer');
const { fork } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const sharp = require('sharp');
const { NormalizeName, Capitalize } = require('../Utils/StringUtil')

const db = require('../models');

var tempFiles = [];
const coverPath = path.join('./public', 'covers', 'folders');

const worker = fork('./workers/screenshot-worker.js');
fs.mkdirsSync(coverPath);

var folderCovers = [];

createCover = async(dir, files) => {
    let folder;
    let firstFile = files.filter(a => a.extension && ['mp4', 'mkv', 'avi', 'ogg', 'webm', 'rar', 'zip']
        .includes(a.extension.toLocaleLowerCase()))[0];

    if (firstFile) {
        let Name = path.basename(dir);
        let tempFolder = await db.folder.findOrCreate({ where: { Name } });

        folder = tempFolder[0];

        let FolderCover = path.join(coverPath, folder.Id + ".jpg");

        if (!fs.existsSync(FolderCover)) {

            let img = files.find(a => a.extension && ['jpg', 'jpeg', 'png', 'gif'].includes(a.extension.toLocaleLowerCase()));

            if (img) {

                await sharp(path.join(dir, img.FileName)).resize({ height: 200 }).toFile(FolderCover);

            } else {
                folderCovers.push({
                    folder: true,
                    filePath: path.join(dir, firstFile.FileName),
                    coverPath: FolderCover,
                    isManga: /rar|zip/ig.test(firstFile.FileName)
                });
            }
        }
    }
    return folder;
}

PopulateDB = async(folder, files, fId, se) => {

    let filteredFile = files.filter((f) => {
        return f.isDirectory || ['mp4', 'mkv', 'avi', 'ogg', 'rar', 'zip'].includes(f.extension.toLocaleLowerCase()) &&
            !f.isHidden
    });

    for (let f of filteredFile) {
        try {
            if (!f.isDirectory) {
                let Id = Math.random().toString(36).slice(-5);
                let found = tempFiles.filter(v => v.Name === f.FileName);
                let vfound = await db.file.findOne({
                    where: {
                        $or: [{
                            Id: Id
                        }, {
                            Name: f.FileName,
                            FolderId: se ? se.Id : null
                        }]
                    }
                });

                if (found.length === 0 && !vfound) {
                    tempFiles.push({
                        Id,
                        Name: f.FileName,
                        NameNormalize: NormalizeName(f.FileName),
                        FullPath: folder,
                        Type: /rar|zip/ig.test(f.extension) ? "Manga" : "Video",
                        DirectoryId: fId,
                        FolderId: se ? se.Id : null,
                        Size: f.Size
                    });
                } else {
                    if (vfound) {
                        let newName = Capitalize(vfound.Name);
                        if (!newName.includes(vfound.Name)) {
                            await vfound.update({ Name: newName });
                            fs.moveSync(path.join(folder, vfound.Name), path.join(folder, newName));
                        }
                    }
                }

            } else {
                let folder = await createCover(f.FileName, f.Files);
                await PopulateDB(f.FileName, f.Files, fId, folder);
            }
        } catch (error) {
            console.log(f, error);
        }
    }

    if (tempFiles.length > 0) await db.file.bulkCreate(tempFiles);
    tempFiles = [];
}

scanOneDir = async(data) => {
    let files = await db.file.findAll({ where: { DirectoryId: data.id } });
    for (let f of files) {
        if (!fs.existsSync(path.join(f.FullPath, f.Name))) await f.destroy();
    }

    var fis = WinDrive.ListFilesRO(data.dir);
    let folder;
    if (fis.length > 0)
        folder = await createCover(data.dir, fis);
    await PopulateDB(data.dir, fis, data.id, folder);

    data.folders = folderCovers;
    worker.send(data);
}

process.on("message", (data) => {

    worker.on('close', () => {
        process.send(data);
        process.exit();
    });

    scanOneDir(data).catch(err => {
        console.log(err);
        process.exit();
    });
});