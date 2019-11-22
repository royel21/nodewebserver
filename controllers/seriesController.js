
const db = require('../models');
const fs = require('fs-extra');

if (!fs.existsSync('./public/covers/series')) fs.mkdirs('./public/covers/series');
loadSeries = async (req, res) => {
    let itemsPerPage = req.query.screenW < 1900 ? 16 : 19;
    let currentPage = req.params.page || 1;
    let begin = ((currentPage - 1) * itemsPerPage);
    let val = "";
    let files = { rows: [], count: 0 };
    let sId = "";
    let items = await db.serie.findAndCountAll({
        order: ['Name'],
        offset: begin,
        limit: itemsPerPage
    });

    if (items.rows.length > 0) {
        sId = items.rows[0].Id;
        files = await db.file.findAndCountAll({
            order: ['NameNormalize'],
            offset: 0,
            limit: itemsPerPage,
            where: { SerieId: sId },
            attributes: ['Id', 'Name', 'SerieId']
        });
    }

    let totalPages = Math.ceil(items.count / itemsPerPage);
    let view = req.query.partial ? "admin/partial-items-home" : "admin/index.pug";

    res.render(view, {
        title: "Series",
        id: "serie",
        sId,
        items,
        itemspages: {
            currentPage,
            itemsPerPage,
            totalPages,
            search: val,
            action: "/admin/series/",
            csrfToken: req.csrfToken()
        },
        files,
        filepages: {
            currentPage: 1,
            itemsPerPage,
            totalPages: Math.ceil(files.count / itemsPerPage),
            search: val,
            action: "/admin/series/",
            csrfToken: req.csrfToken()
        }
    }, (err, html) => {
        if (err) console.log(err);

        if (req.query.partial) {
            res.send({ url: "/admin" + req.url, data: html });
        } else {
            res.send(html);
        }
    });
}

exports.series = (req, res) => {
    loadSeries(req, res).catch(err => {
        if (err) console.log(err);
        res.status(500).send('Internal Server Error');
    });
}

exports.itemsList = (req, res) => {
    let itemsPerPage = req.query.screenW < 1900 ? 16 : 19;
    let currentPage = req.query.page || 1;
    let begin = ((currentPage - 1) * itemsPerPage);
    let val = req.query.search || "";
    db.serie.findAndCountAll({
        order: ['Name'],
        offset: begin,
        limit: itemsPerPage,
        where: {
            Name: {
                [db.Op.like]: "%" + val + "%"
            }
        }
    }).then(items => {

        res.render('admin/partial-items-list', {
            items,
            itemspages: {
                currentPage,
                itemsPerPage,
                totalPages: Math.ceil(items.count / itemsPerPage),
                search: val,
                action: "/admin/series/",
                csrfToken: req.csrfToken(),
                isList: true,
                id: 'series'
            }
        })
    }).catch(err => {
        if (err) console.log(err);
        res.status(500).send('Internal Server Error');
    });
}

exports.filesList = (req, res) => {
    let itemsPerPage = req.query.screenW < 1900 ? 16 : 19;
    let currentPage = req.query.page || 1;
    let begin = ((currentPage - 1) * itemsPerPage);
    let val = req.query.search || "";

    let serieId = req.query.id;
    let view = req.query.isAllFiles === "true";
    if (view) {
        serieId = null;
    }
    let condition = {
        order: ['NameNormalize'],
        offset: begin,
        limit: itemsPerPage,
        attributes: ['Id', 'Name'],
        where: {
            [db.Op.and]: [{ Name: { [db.Op.like]: "%" + val + "%" } }, { SerieId: serieId }]
        }
    };

    db.file.findAndCountAll(condition).then(files => {
        var totalPages = Math.ceil(files.count / itemsPerPage);
        res.render('admin/partial-file-list', {
            files,
            filepages: {
                currentPage,
                itemsPerPage,
                totalPages,
                search: val,
                action: "/admin/series/",
                csrfToken: req.csrfToken(),
                isList: view
            }
        });
    }).catch(err => {
        if (err) console.log(err);
        res.status(500).send('Internal Server Error');
    });
}

exports.addFiles = (req, res) => {
    let serieId = req.body.itemId;
    let fileId = req.body.fileId || null;
    let search = req.body.search || "";
    let condition = {
        order: ['NameNormalize'],
        attributes: ['Id', 'Name'],
        where:
            fileId ? { [db.Op.and]: [{ Id: fileId }, { SerieId: null }] } :
                {
                    [db.Op.and]: [{ Name: { [db.Op.like]: "%" + search + "%" } }, { SerieId: null }]
                }
    };

    db.serie.findOne({ where: { Id: serieId } }).then(serie => {
        if (serie) {
            db.file.findAll(condition).then(files => {
                serie.addFiles(files);
                res.send({ count: files.length });
            }).catch(err => {
                if (err) console.log(err);
                res.status(500).send('Internal Server Error');
            });
        }
    }).catch(err => {
        if (err) console.log(err);
        res.status(500).send('Internal Server Error');
    });
}


exports.removeFile = (req, res) => {
    let Id = req.body.fileId;
    db.file.update(
        { SerieId: null },
        { where: { Id } }
    ).then(result => {
        console.log('result:', result);

        res.send({ state: "Ok", Id });

    }).catch(err => {
        if (err) console.log(err);
        res.status(500).send('Internal Server Error');
    });
}