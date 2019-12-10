const db = require('../../models');

var getCategoryFiles = async(data) => {
    return await db.file.findAndCountAll({
        atributtes: ['Id', 'Name'],
        order:['Name'],
        offset: data.begin,
        limit: data.itemsPerPage,
        where: {
            [db.Op.and]: [{
                Name: {
                    [db.Op.like]: "%" + data.val + "%"
                }
            }, db.sqlze.literal(`File.Id ${data.not} IN (Select FileId from FileCategories where CategoryId = '${data.caId}')`)]
        }
    });
}

var loadCategories = async(req, res) => {
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
        files = await getCategoryFiles({ val: '', caId: cat.Id, not: '', begin: 0, itemsPerPage });
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

var loadFiles = async(req, res) => {
    let itemsPerPage = req.query.screenW < 1900 ? 16 : 19;
    let currentPage = req.query.page || 1;
    let begin = ((currentPage - 1) * itemsPerPage);
    let val = req.query.search ? `${req.query.search}` : "";

    let caId = req.query.id;
    let allFiles = req.query.isAllFiles == "true";

    let not = allFiles ? "not" : "";

    console.time('s')
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
        order: ['Name'],
        attributes: ['Id'],
        where: fileId ? { Id: fileId } : {
            Name: {
                [db.Op.like]: "%" + search + "%"
            }
        }
    };

    db.category.findOne({ where: { Id } }).then(category => {
        if (category) {
            db.file.findAll(condition).then(files => {
                category.addFiles(files);
                res.send({ count: files.length });
            });
        }
    }).catch(err => {
        if (err) console.log(err);
        res.status(500).send('Internal Server Error');
    });
}

exports.removeFile = async(req, res) => {
    let catId = req.body.itemId;
    let fId = req.body.fileId || null;
    let result = await db.fileCategory.destroy({ where: { FileId: fId, CategoryId: catId } });
    if (result > 0) {
        return res.send({ status: "Ok" });
    } else {
        return res.send({ status: "error", msg: 'Could not remove file ' });
    }
}