
const db = require('../models');
const fs = require('fs-extra');
const path = require('path');

const coverPath = './static/covers/series/';

if (!fs.existsSync('./static/covers/series')) fs.mkdirs('./static/covers/series');
loadSeries = async (req, res) => {
    console.log(req.screenW)
    let itemsPerPage = req.screenW < 1900 ? 16 : 18;
    let currentPage = req.params.page || 1;
    let begin = ((currentPage - 1) * itemsPerPage);
    let val = "";
    let videos = { rows: [], count: 0 };
    let sId = "";
    let series = await db.serie.findAndCountAll({
        order:  ['Name'],
        offset: begin,
        limit: itemsPerPage
    });
    
    if (series.rows.length > 0) {
        sId = series.rows[0].Id
        videos = await db.video.findAndCountAll({
            order: ['NameNormalize'],
            offset: 1,
            limit: itemsPerPage,
            where: { SerieId: sId },
            attributes: [ 'Id', 'Name' ]
        });
        
    }
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
    let name = req.body.name;
    db.serie.destroy({ where: { Id: id } }).then(result => {
        if (result > 0) {
            let cover = path.join(coverPath, name + ".jpg");
            if (fs.existsSync(cover)) {
                fs.removeSync(cover);
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
    let itemsPerPage = req.screenW < 1900 ? 16 : 18;
    let currentPage = req.query.page || 1;
    let begin = ((currentPage - 1) * itemsPerPage);
    let val = req.query.search || "";

    let serieId = req.query.serieId;
    let view = req.query.isAllVideo === "true";
    let condition = {
        order: ['NameNormalize'],
        offset: begin,
        limit: itemsPerPage,
        attributes: [ 'Id', 'Name' ],
        where:{
            [db.Op.and]: [{Name: { [db.Op.like]: "%" + val + "%" }}, {SerieId: serieId}]
        }
    };

    db.video.findAndCountAll(condition).then(videos => {

        var totalPages = Math.ceil(videos.count / itemsPerPage);
        res.render('admin/series/partial-serie-videos', {
            videos,
            videopages: {
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


exports.addVideosToSerie = (req, res) => {
    let serieId = req.body.serieId;
    let videoId = req.body.videoId || null;
    let search = req.body.search || "";
    let condition = {
        order: ['NameNormalize'],
        attributes: [ 'Id', 'Name' ],
        where:
            videoId ? { [db.Op.and]:[{Id: videoId}, {SerieId: null}] } :
                {
                    [db.Op.and]: [{Name: { [db.Op.like]: "%" + search + "%" }}, {SerieId: null}]
                }
    };

    db.serie.findOne({ where: { Id: serieId } }).then(serie => {
        if (serie) {
            db.video.findAll(condition).then(videos => {
                serie.addVideos(videos);
                res.send({ count: videos.length });
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