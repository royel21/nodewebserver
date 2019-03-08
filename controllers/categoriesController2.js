
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
            action: "/admin/categories/videos/",
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
