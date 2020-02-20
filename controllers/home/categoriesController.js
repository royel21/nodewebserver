const db = require('../../models');
const helper = require('./file-helper');

var loadCategories = async (req, res) => {
    console.time("cat")
    let currentCat = req.params.cat;
    let orderby = req.params.orderby || "nu";

    let search = req.params.search || "";
    let itemsPerPage = parseInt(req.params.items || req.query.items) || req.itemsPerPage;
    let currentPage = parseInt(req.params.page) || 1;
    let begin = ((currentPage - 1) * itemsPerPage);

    let categories = await db.category.findAll({ order: ['Name'] });

    let items = { count: 0, rows: [] };
    if (categories.length > 0) {
        let cat = categories.find((c) => { return c.Name.includes(currentCat) }) || categories[0];
        
        items = await helper.getFiles(req.user,
            { id: cat.Id, begin, itemsPerPage, search },
            db.category, helper.getOrderBy(orderby)
        );

        currentCat = cat.Name;
    }

    let totalPages = Math.ceil(items.count / itemsPerPage);
    let view = req.query.partial ? "home/partial-items-view" : "home/index.pug";

    return res.render(view, {
        title: "Home Server",
        items,
        pagedatas: {
            orderby,
            currentPage,
            itemsPerPage,
            totalPages,
            search: search,
            action: `/categories/${orderby}/${currentCat}/`,
            csrfToken: req.csrfToken(),
            step: req.step,
            list: currentCat
        },
        isFile: true,
        categories
    }, (err, html) => {
        if (err) console.log(err);

        if (req.query.partial) {
            res.send({ url: `/categories/${orderby}/${currentCat}/`, data: html });
        } else {
            res.send(html);
        }
        console.timeEnd("cat");
    });
}

exports.categories = (req, res) => {
    loadCategories(req, res).catch(err => {
        if (err) console.log(err);
        res.status(500).send('Internal Server Error');
    });
}

exports.postSearch = (req, res) => {
    let itemsPerPage = parseInt(req.body.items) || 1;
    let orderby = req.params.orderby || "nu";
    let search = req.body.search || "";
    let cat = req.body.cat;
    let url = `/categories/${orderby}/`;

    if (cat) {
        return res.redirect(url + `${cat}/1/${itemsPerPage}/${search}?partial=true`);
    } else {
        db.category.findOne({ order: ['Name'] }).then(category => {

            if (category) {
                url += category.Name + `/1/${itemsPerPage}/${search}?partial=true`;
            }
            console.log(url)
            return res.redirect(url);
        });
    }
}