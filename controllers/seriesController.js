
const db = require('../models');
const fs = require('fs-extra');
const coverPath = './static/covers/series/';

if (!fs.existsSync('./static/covers/series')) fs.mkdirs('./static/covers/series');

loadSeries = async (req, res) => {
    let sId = req.params.serieId
    let itemsPerPage = 12;
    let currentPage = req.params.page || 1;
    let begin = ((currentPage - 1) * itemsPerPage);
    let val = "";
    let videos = await db.video.findAndCountAll({
        order: ['Name'],
        offset: 1,
        limit: itemsPerPage,
        where: { Id: sId }
    });

    let series = await db.serie.findAndCountAll({
        order: ['Name'],
        offset: begin,
        limit: itemsPerPage
    });

    let totalPages = Math.ceil(series.count / itemsPerPage);
    let view = req.query.partial ? "admin/series/partial-series-table" : "admin/index.pug";

    res.render(view, {
        title: "Series - Manager",
        sId,
        series,
        videos,
        videopages: {
            currentPage: 1,
            itemsPerPage,
            totalPages: Math.ceil(videos.count / itemsPerPage),
            search: val,
            action: "/admin/series/",
            csrfToken: req.csrfToken()
        },
        seriepages: {
            currentPage,
            itemsPerPage,
            totalPages,
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

exports.videoList = (req, res) => {
    let sId = req.params.serieId;
    let itemsPerPage = 12;
    let currentPage = req.params.page || 1;
    let begin = ((currentPage - 1) * itemsPerPage);
    let val = "";
    db.video.findAndCountAll({
        order: ['Name'],
        offset: begin,
        limit: itemsPerPage,
        where: { Id: sId }
    }).then(videos => {

        res.render('admin/series/partial-series-table', {
            title: "Series - Manager",
            sId,
            series,
            videos,
            videopages: {
                currentPage: 1,
                itemsPerPage,
                totalPages: Math.ceil(videos.count / itemsPerPage),
                search: val,
                action: "/admin/series/",
                csrfToken: req.csrfToken(),
                isAdd: sId || true
            }
        });
    });
}

exports.modal = (req, res) => {
    let id = req.query.uid;
    console.log(req.query)
    db.serie.findOne({ where: { Id: id } }).then(serie => {
        res.render('admin/series/modal', {
            serie, csrfToken: req.csrfToken(),
            modalTitle: id ? "Editar Serie" : "Agregar Serie"
        });
    }).catch(err => {
        if (err) console.log(err);
        res.status(500).send('Internal Server Error');
    });

}

createSerie = (req, res) => {
    const name = req.body.name;
    const file = req.files.cover;

    if (file) {
        db.serie.create({ Name: name }).then(serie => {
            if (serie) {
                file.mv(coverPath + `${serie.id}.jpg`, (err) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).send('Internal Server Error');
                    }
                    res.render('admin/series/row', { serie });
                });
            } else {
                if (err) console.log(err);
                res.status(500).send('File no create');
            }
        }).catch(err => {
            if (err) console.log(err);
            res.status(500).send('Internal Server Error');
        });
    } else {
        res.status(500).send('Elija Un Archivo');
    }
}

exports.modalPost = (req, res) => {

    if (!req.body.id) {
        createSerie(req, res);
    } else {
        res.send('Ok');
    }
}

exports.deleteSerie = (req, res) => {
    let id = req.body.id;
    db.serie.destroy({ where: { Id: id } }).then(result => {
        if (result > 0) {
            if (fs.existsSync(coverPath + id + ".jpg")) {
                fs.removeSync(coverPath + id + ".jpg");
            }
            res.send({ state: "ok", id });
        } else {
            res.status(500).send('Internal Server Error');
        }
    }).catch(err => {
        if (err) console.log(err);
        res.status(500).send('Internal Server Error');
    });
}
exports.listVideos = (req, res) => {
    res.send("from List");
}

exports.allVideos = (req, res) => {
    let itemsPerPage = 12;
    let currentPage = req.params.page || 1;
    let begin = ((currentPage - 1) * itemsPerPage);
    let val = req.params.search || "";

    db.video.findAndCountAll({
        order: ['Name'],
        offset: begin,
        limit: itemsPerPage,
        where: {
            Name: {
                [db.Op.like]: "%" + val + "%"
            }
        }
    }).then(videos => {

        var totalPages = Math.ceil(videos.count / itemsPerPage);

        res.render('admin/series/partial-serie-videos', {
            videos,
            videopages: {
                currentPage,
                itemsPerPage,
                totalPages,
                search: val,
                action: "/admin/series/",
                csrfToken: req.csrfToken()
            }
        });
    }).catch(err => {
        if (err) console.log(err);
        res.status(500).send('Internal Server Error');
    });
}