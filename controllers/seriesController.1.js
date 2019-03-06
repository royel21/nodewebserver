
const db = require('../models');

loadCategories = async (req, res) => {
    console.log(req.screenW)
    let itemsPerPage = req.screenW < 1900 ? 15 : 18;
    let cId;
    let categories = await db.serie.findAndCountAll({
        order:  ['Name'],
        offset: 0,
        limit: itemsPerPage
    });
    
    if (categories.rows.length > 0) {
        cId = categories.rows[0].Id
        let cat = await db.category.findOne({where:{Id: cId}});
        
        videos = await cat.getVideos.findAndCountAll({
            order: ['NameNormalize'],
            offset: 1,
            limit: itemsPerPage,
            where: { SerieId: sId },
            attributes: [ 'Id', 'Name' ]
        });
        
    }

    let totalPages = Math.ceil(categories.count / itemsPerPage);
    let view = req.query.partial ? "admin/categories/partial-categories-table" : "admin/index.pug";

    res.render(view, {
        title: "categories - Manager",
        cId,
        categories,
        videos,
        videopages: {
            currentPage: 1,
            itemsPerPage,
            totalPages: Math.ceil(videos.count / itemsPerPage),
            search: val,
            action: "/admin/categories/",
            csrfToken: req.csrfToken()
        },
        categorypages: {
            currentPage: 1,
            itemsPerPage,
            totalPages,
            search: val,
            action: "/admin/categories/",
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

exports.categories = (req, res) => {
    loadCategories(req, res).catch(err => {
        if (err) console.log(err);
        res.status(500).send('Internal Server Error');
    });
}
