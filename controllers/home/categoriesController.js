const db = require('../../models');

var loadCategories = async(req, res) => {
    console.time('s');
    let currentCat = await req.params.cat;

    if (!currentCat) {
        let firstCat = await db.category.findOne({ order: ['Name'] });
        if (firstCat) {
            let partial = req.query.partial ? '?partial=true' : "";
            return res.redirect('/categories/' + firstCat.Name + partial);
        }
    }

    let user = req.user;

    let search = req.params.search || "";
    let itemsPerPage = parseInt(req.params.items || req.query.items) || req.itemsPerPage;
    let currentPage = parseInt(req.params.page) || 1;
    let begin = ((currentPage - 1) * itemsPerPage);

    let categories = await db.category.findAll();

    let items = { count: 0, rows: [] };
    if (categories.length > 0) {
        let cat = categories.find((c) => { return c.Name.includes(currentCat) });

        items = await db.file.findAndCountAll({
            attributes: {
                include: [
                    'Id', 'Name', 'DirectoryId', 'Type', 'Duration', [db.sqlze.literal("REPLACE(Name, '[','0')"), 'N'],
                    [db.sqlze.literal("(Select LastPos from RecentFiles where FileId == File.Id and RecentId == '" + user.Recent.Id + "')"), "CurrentPos"],
                    [db.sqlze.literal("(Select FileId from FavoriteFiles where FileId == File.Id and FavoriteId == '" + user.Favorite.Id + "')"), "isFav"]
                ]
            },
            include: [{
                model: db.category,
                where: {
                    Id: cat.Id
                }
            }],
            order: [db.sqlze.col('N')],
            offset: begin,
            limit: itemsPerPage,
            where: {
                [db.Op.and]: [{
                    Name: {
                        [db.Op.like]: "%" + search + "%"
                    }
                }]
            }
        });
    }

    let totalPages = Math.ceil(items.count / itemsPerPage);
    let view = req.query.partial ? "home/partial-items-view" : "home/index.pug";

    console.timeEnd('s');
    return res.render(view, {
        title: "Home Server",
        items,
        pagedatas: {
            currentPage,
            itemsPerPage,
            totalPages,
            search: search,
            action: "/categories/",
            csrfToken: req.csrfToken(),
            step: req.step,
            cat: currentCat
        },
        isFile: true,
        categories
    }, (err, html) => {
        if (err) console.log(err);

        if (req.query.partial) {
            res.send({ url: req.url, data: html });

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

exports.postSearch = (req, res) => {
    let itemsPerPage = parseInt(req.body.items) || 1;
    let search = req.body.search || "";
    let cat = req.body.cat;
    let url = '/categories/';

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