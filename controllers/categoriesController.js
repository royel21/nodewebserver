
const db = require('../models');

getCategoryVideos = async (data) => {
    let videos = { count: 0, rows: [] };
    let count = await db.sqlze.query(`Select count(*) as count 
    from Videos where Name LIKE ? and Id ${data.not} in(Select VideoId from VideoCategories where CategoryId = ?)`,
        {
            replacements: [data.val, data.caId],
            type: db.sqlze.QueryTypes.SELECT
        });
    videos.count = count[0].count;
    videos.rows = await db.sqlze.query(`Select Id, Name, NameNormalize 
        from Videos where Name LIKE ? and Id ${data.not} in(Select VideoId 
        from VideoCategories where CategoryId = ?) 
        ORDER BY NameNormalize limit ?, ?;`,
        {
            model: db.video,
            mapToModel: true,
            replacements: [data.val, data.caId, data.begin, data.itemsPerPage],
            type: db.sqlze.QueryTypes.SELECT
        });
    return videos;
}
loadCategories = async (req, res) => {
    console.log(req.screenW)
    let itemsPerPage = req.screenW < 1900 ? 16 : 19;
    let cat;
    let cId = "";
    let items = await db.category.findAndCountAll({
        order: ['Name'],
        offset: 0,
        limit: itemsPerPage
    });

    let videos = { count: 0, rows: [] };

    if (items.rows.length > 0) {
        cat = items.rows[0];
        videos = await getCategoryVideos({ val: '%%', caId: cat.Id, not: '', begin: 0, itemsPerPage });
    }

    let totalPages = Math.ceil(items.count / itemsPerPage);
    let view = req.query.partial ? "admin/partial-items-home" : "admin/index.pug";

    res.render(view, {
        title: "Categorias",
        id: "category",
        cId,
        items,
        itemspages: {
            currentPage: 1,
            itemsPerPage,
            totalPages,
            search: "",
            action: "/admin/categories/",
            csrfToken: req.csrfToken(),
            isList: true
        },
        videos,
        videopages: {
            currentPage: 1,
            itemsPerPage,
            totalPages: Math.ceil(videos.count / itemsPerPage),
            search: "",
            action: "/admin/categories/",
            csrfToken: req.csrfToken(),
            isList: false
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
    let itemsPerPage = req.screenW < 1900 ? 16 : 19;
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
    console.time('s')
    let itemsPerPage = req.screenW < 1900 ? 16 : 19;
    let currentPage = req.query.page || 1;
    let begin = ((currentPage - 1) * itemsPerPage);
    let val = req.query.search ? `%${req.query.search}%` : "%%";

    let caId = req.query.id;
    
    let allVideos = req.query.isAllVideo == "true";

    let not = allVideos ? "not" : "";
    
    let videos = await getCategoryVideos({ val, caId, not, begin, itemsPerPage });

    console.timeEnd('s');
    val = req.query.search || "";
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

    db.category.findOne({ where: { Id } }).then(category => {
        if (category) {
            db.video.findAll(condition).then(videos => {

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
    let catId = req.body.itemId;
    let vId = req.body.videoId || null;
    db.video.findOne({ where: { Id: vId } }).then(video => {
        db.category.findOne({ where: { Id: catId } }).then(cat => {
            cat.removeVideo(video).then(result => {
                res.send({ state: "Ok" });
            })
        });
    }).catch(err => {
        console.log(err);
        res.send({ state: "error", msg: err });
    });
}