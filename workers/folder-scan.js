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

var DirectoryId;

createCover = async(dir, files) => {
    let folder;
    let firstFile = files.filter(a => a.extension && ['mp4', 'mkv', 'avi', 'ogg', 'webm', 'rar', 'zip']
        .includes(a.extension.toLocaleLowerCase()))[0];

    if (firstFile) {
        let Name = path.basename(dir);
        let tempFolder = await db.folder.findOrCreate({ where: { Name, DirectoryId } });

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

PopulateDB = async(folder, files, fd) => {

    let filteredFile = files.filter((f) => {
        return f.isDirectory || ['mp4', 'mkv', 'avi', 'ogg', 'rar', 'zip'].includes(f.extension.toLocaleLowerCase()) &&
            !f.isHidden
    });

    for (let f of filteredFile) {
        try {
            if (!f.isDirectory) {
                let Id = Math.random().toString(36).slice(-5);
                let found = tempFiles.filter(v => v.Name === f.FileName);
                let vfound = await db.file.findAll({
                    where: {
                        $or: [{
                            Id: Id
                        }, {
                            Name: f.FileName
                        }]
                    }
                });
                
                if (found.length === 0 && vfound.length === 0) {
                    tempFiles.push({
                        Id,
                        Name: f.FileName,
                        FullPath: folder,
                        Type: /rar|zip/ig.test(f.extension) ? "Manga" : "Video",
                        DirectoryId,
                        FolderId: fd ? fd.Id : null,
                        Size: f.Size
                    });
                } 

            } else {
                let folder = await createCover(f.FileName, f.Files);
                await PopulateDB(f.FileName, f.Files, folder);
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

    DirectoryId = data.id;

    var fis = WinDrive.ListFilesRO(data.dir);
    let folder;
    if (fis.length > 0)
        folder = await createCover(data.dir, fis);
        
    await PopulateDB(data.dir, fis, folder);

    data.folders = folderCovers;
    worker.send(data);
}

process.on("message", (data) => {

    worker.on('close', () => {
        process.exit();
    });
    
    scanOneDir(data).catch(err => {
        console.log(err);
        process.exit();
    });
});