
const db = require('../models');
const fs = require('fs-extra');

if (!fs.existsSync('./static/covers/series')) fs.mkdirs('./static/covers/series');
loadSeries = async (req, res) => {
    let itemsPerPage = req.screenW < 1900 ? 19 : 24;
    let currentPage = req.params.page || 1;
    let begin = ((currentPage - 1) * itemsPerPage);
    let val = "";
    let videos = { rows: [], count: 0 };
    let sId = "";
    let series = await db.serie.findAndCountAll({
        order: ['Name'],
        offset: begin,
        limit: itemsPerPage
    });

    if (series.rows.length > 0) {
        sId = series.rows[0].Id;
        videos = await db.video.findAndCountAll({
            order: ['NameNormalize'],
            offset: 0,
            limit: itemsPerPage,
            where: { SerieId: sId },
            attributes: ['Id', 'Name', 'SerieId']
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

exports.itemsList = (req, res) => {
    let itemsPerPage = req.screenW < 1900 ? 19 : 24;
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

exports.videosList = (req, res) => {
    let itemsPerPage = req.screenW < 1900 ? 19 : 24;
    let currentPage = req.query.page || 1;
    let begin = ((currentPage - 1) * itemsPerPage);
    let val = req.query.search || "";

    let serieId = req.query.id;
    let view = req.query.isAllVideo === "true";
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

    db.video.findAndCountAll(condition).then(videos => {
        var totalPages = Math.ceil(videos.count / itemsPerPage);
        res.render('admin/partial-video-list', {
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

exports.addVideos = (req, res) => {
    let serieId = req.body.itemId;
    let videoId = req.body.videoId || null;
    let search = req.body.search || "";
    let condition = {
        order: ['NameNormalize'],
        attributes: ['Id', 'Name'],
        where:
            videoId ? { [db.Op.and]: [{ Id: videoId }, { SerieId: null }] } :
                {
                    [db.Op.and]: [{ Name: { [db.Op.like]: "%" + search + "%" } }, { SerieId: null }]
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


exports.removeVideo = (req, res) => {
    let Id = req.body.VideoId;

    db.video.update(
        { SerieId: null },
        { where: { Id } }
    ).then(result => {
        console.log('result:', result)
        res.send({ state: "Ok", Id });

    }).catch(err => {
        if (err) console.log(err);
        res.status(500).send('Internal Server Error');
    });
}