
const db = require('../models');

loadCategories = async (req, res) => {
    console.log(req.screenW)
    let itemsPerPage = req.screenW < 1900 ? 16 : 18;
    let cat;
    let cId = "";
    let categories = await db.category.findAndCountAll({
        order: ['Name'],
        offset: 0,
        limit: itemsPerPage
    });

    let videos = { count: 0, rows: [] };

    if (categories.rows.length > 0) {
        cat = categories.rows[0];
        let vis = await cat.getVideos({
            order: ['NameNormalize'],
            attributes: ['Id', 'Name']
        });
        videos.rows = vis.slice(0, itemsPerPage)
        videos.count = vis.length;
    }

    let totalPages = Math.ceil(categories.count / itemsPerPage);
    let view = req.query.partial ? "admin/categories/partial-categories-table" : "admin/index.pug";

    res.render(view, {
        title: "Category - Manager",
        cId,
        categories,
        videos,
        videopages: {
            currentPage: 1,
            itemsPerPage,
            totalPages: Math.ceil(videos.count / itemsPerPage),
            search: "",
            action: "/admin/categories/",
            csrfToken: req.csrfToken(),
            isList: false
        },
        categorypages: {
            currentPage: 1,
            itemsPerPage,
            totalPages,
            search: "",
            action: "/admin/categories/",
            csrfToken: req.csrfToken(),
            isList: true
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

exports.categories = (req, res) => {
    loadCategories(req, res).catch(err => {
        if (err) console.log(err);
        res.status(500).send('Internal Server Error');
    });
}

exports.itemsList = (req, res) => {
    let itemsPerPage = req.screenW < 1900 ? 16 : 18;
    let currentPage = req.query.page || 1;
    let begin = ((currentPage - 1) * itemsPerPage);
    let val = req.query.search || "";

    db.category.findAndCountAll({
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
                action: "/admin/categories/",
                csrfToken: req.csrfToken(),
                isList: true,
                id: 'category'
            }
        })
    }).catch(err => {
        if (err) console.log(err);
        res.status(500).send('Internal Server Error');
    });
}

const loadVideos = async (req, res) => {
    let itemsPerPage = req.screenW < 1900 ? 16 : 18;
    let currentPage = req.query.page || 1;
    let begin = ((currentPage - 1) * itemsPerPage);
    let val = req.query.search || "";

    let caId = req.query.id;
    let videos = { count: 0, rows: 0 };
    let allVideos = req.query.isAllVideo == "true";

    if (allVideos) {
        videos = await db.video.findAndCountAll({
            order: ['NameNormalize'],
            offset: begin,
            limit: itemsPerPage,
            attributes: ['Id', 'Name'],
            where: {
                Name: {
                    [db.Op.like]: "%" + val + "%"
                }
            }
        });
    } else {

        let cat = await db.category.find({ where: { Id: caId } });
        let vis = await cat.getVideos({
            order: ['NameNormalize'],
            attributes: ['Id', 'Name'],
            where: {
                Name: {
                    [db.Op.like]: "%" + val + "%"
                }
            }
        });
        videos.rows = vis.slice(begin, itemsPerPage)
        videos.count = vis.length;
    }

    res.render('admin/partial-video-list', {
        videos,
        videopages: {
            currentPage,
            itemsPerPage,
            totalPages: Math.ceil(videos.count / itemsPerPage),
            search: val,
            action: "/admin/categories/",
            csrfToken: req.csrfToken(),
            isList: allVideos,
        }
    });
}

exports.videosList = (req, res) => {
    loadVideos(req, res).catch(err => {
        if (err) console.log(err);
        res.status(500).send('Internal Server Error');
    });
}


exports.addVideos = (req, res) => {
    let Id = req.body.itemId;
    let videoId = req.body.videoId || null;
    let search = req.body.search || "";
    let condition = {
        order: ['NameNormalize'],
        attributes: ['Id'],
        where:
            videoId ? { Id: videoId } : { Name: { [db.Op.like]: "%" + search + "%" } }
    };
    console.log(condition)
    db.category.findOne({ where: { Id } }).then(category => {
        if (category) {
            db.video.findAll(condition).then(videos => {
                console.log("videos found:"+videos.length)
                category.addVideos(videos);
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
    let Id = req.body.itemId;
    let videoId = req.body.videoId || null;
    console.log(req.body)
    // if (Id) {
        db.category.findById(Id).then(cat => {
            console.log(cat)
    //         if (cat) {
                console.log(cat.Video_Category)
    //             res.send({ state: "ok" });
    //         }else
    //         res.send({ state: "error", msg: "Not Found:"+Id })
        }).catch(err => {
            console.log(err);
            res.send({ state: "error", msg: err });
        });
    // } else {
    //     res.send({ state: "error", msg: "Id can be null" });
    // }
    res.send({ state: "error", msg: "Id can be null" });
}