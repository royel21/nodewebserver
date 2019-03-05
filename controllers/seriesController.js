
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

    db.serie.create({ Name: name }).then(serie => {
        if (serie) {
            if (file) {
                file.mv(coverPath + `${serie.id}.jpg`, (err) => {
                    if (err) {
                        console.log(err);
                        return res.send({ err: "500", message: err });
                    }
                    res.render('admin/series/row', { serie });
                });
            } else {
                res.render('admin/series/row', { serie });
            }
        } else {
            if (err) console.log(err);
            res.send({ err: "500", message: err });
        }
    }).catch(err => {
        if (err) console.log(err);
        res.send({ err: "500", message: err });
    });
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

exports.videosList = (req, res) => {
    console.log("params:", db.Op.like);
    let itemsPerPage = 10;
    let currentPage = req.query.page || 1;
    let begin = ((currentPage - 1) * itemsPerPage);
    let val = req.query.search || "";

    let serieId = req.query.serieId;
    let view = req.query.isAllVideo === "true";
    let condition = {
        order: ['Name'],
        offset: begin,
        limit: itemsPerPage
    };

    if (view) {
        condition.where = {
            Name: { [db.Op.like]: "%" + val + "%" }
        };
    } else {
        condition.where = { SerieId: serieId };
    }
    db.video.findAndCountAll(condition).then(videos => {

        var totalPages = Math.ceil(videos.count / itemsPerPage);

        res.render('admin/series/partial-serie-videos', {
            videos,
            videopages: {
                currentPage,
                itemsPerPage,
                totalPages,
                search: val,
                action: "",
                csrfToken: req.csrfToken(),
                isList: view
            }
        });
    }).catch(err => {
        if (err) console.log(err);
        res.status(500).send('Internal Server Error');
    });
}


exports.addVideosToSerie = (req, res) => {
    let serieId = req.body.serieId;
    let videoId = req.body.videoId || null;
    let search = req.body.search || "";
    
    db.serie.findOne({ where: { Id: serieId } }).then(serie => {
        if (serie) {
            db.video.findAll({
                where: {
                    [db.Op.or]:
                        [{ Name: { [db.Op.like]: "%" + search + "%" } },
                        { Id: videoId }]
                }
            }).then(videos => {
                console.log(videos);
                serie.addVideos(videos);
                res.send({count: videos.length });

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