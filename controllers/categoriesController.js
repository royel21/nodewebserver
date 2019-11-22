
const db = require('../models');

getCategoryFiles = async (data) => {
    let files = { count: 0, rows: [] };
    let count = await db.sqlze.query(`Select count(*) as count 
    from Files where Name LIKE ? and Id ${data.not} in(Select FileId from FileCategories where CategoryId = ?)`,
        {
            replacements: [data.val, data.caId],
            type: db.sqlze.QueryTypes.SELECT
        });
    files.count = count[0].count;
    files.rows = await db.sqlze.query(`Select Id, Name, NameNormalize 
        from Files where Name LIKE ? and Id ${data.not} in(Select FileId 
        from FileCategories where CategoryId = ?) 
        ORDER BY NameNormalize limit ?, ?;`,
        {
            model: db.file,
            mapToModel: true,
            replacements: [data.val, data.caId, data.begin, data.itemsPerPage],
            type: db.sqlze.QueryTypes.SELECT
        });
    return files;
}
loadCategories = async (req, res) => {
    let itemsPerPage = req.query.screenW < 1900 ? 16 : 19;
    let cat;
    let cId = "";
    let items = await db.category.findAndCountAll({
        order: ['Name'],
        offset: 0,
        limit: itemsPerPage
    });

    let files = { count: 0, rows: [] };

    if (items.rows.length > 0) {
        cat = items.rows[0];
        files = await getCategoryFiles({ val: '%%', caId: cat.Id, not: '', begin: 0, itemsPerPage });
    }

    let totalPages = Math.ceil(items.count / itemsPerPage);
    let view = req.query.partial ? "admin/partial-items-home" : "admin/index.pug";

    res.render(view, {
        title: "Categories",
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
        files,
        filepages: {
            currentPage: 1,
            itemsPerPage,
            totalPages: Math.ceil(files.count / itemsPerPage),
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
    let itemsPerPage = req.query.screenW < 1900 ? 16 : 19;
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

const loadFiles = async (req, res) => {
    console.time('s')
    let itemsPerPage = req.query.screenW < 1900 ? 16 : 19;
    let currentPage = req.query.page || 1;
    let begin = ((currentPage - 1) * itemsPerPage);
    let val = req.query.search ? `%${req.query.search}%` : "%%";

    let caId = req.query.id;
    
    let allFiles = req.query.isAllFile == "true";

    let not = allFiles ? "not" : "";
    
    let files = await getCategoryFiles({ val, caId, not, begin, itemsPerPage });

    console.timeEnd('s');
    val = req.query.search || "";
    res.render('admin/partial-file-list', {
        files,
        filepages: {
            currentPage,
            itemsPerPage,
            totalPages: Math.ceil(files.count / itemsPerPage),
            search: val,
            action: "/admin/categories/",
            csrfToken: req.csrfToken(),
            isList: allFiles,
        }
    });
}

exports.filesList = (req, res) => {

    loadFiles(req, res).catch(err => {
        if (err) console.log(err);
        res.status(500).send('Internal Server Error');
    });
}


exports.addFiles = (req, res) => {
    let Id = req.body.itemId;
    let fileId = req.body.fileId || null;
    let search = req.body.search || "";
    let condition = {
        order: ['NameNormalize'],
        attributes: ['Id'],
        where:
            fileId ? { Id: fileId } : { Name: { [db.Op.like]: "%" + search + "%" } }
    };

    db.category.findOne({ where: { Id } }).then(category => {
        if (category) {
            db.file.findAll(condition).then(files => {

                category.addFiles(files);
                res.send({ count: files.length });
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

exports.removeFile = (req, res) => {
    let catId = req.body.itemId;
    let vId = req.body.fileId || null;
    db.file.findOne({ where: { Id: vId } }).then(file => {
        db.category.findOne({ where: { Id: catId } }).then(cat => {
            cat.removeFile(file).then(result => {
                res.send({ state: "Ok" });
            })
        });
    }).catch(err => {
        console.log(err);
        res.send({ state: "error", msg: err });
    });
}