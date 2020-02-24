const db = require('../../models');
const helper = require('./file-helper');

exports.recent = (req, res) => {
    let itemsPerPage = parseInt(req.params.items || req.query.items) || req.itemsPerPage;
    let currentPage = parseInt(req.params.page) || 1;
    let begin = ((currentPage - 1) * itemsPerPage) || 0;
    let search = req.params.search || "";

    let order = [
        [db.sqlze.literal("LastRead"), 'DESC']
    ]

    console.time("rec")
    helper.getFiles(req.user, { id: req.user.Recent.Id, begin, itemsPerPage, search }, db.recent, order).then(items => {
        items.count = items.count > 100 ? 100 : items.count
        var totalPages = Math.ceil(items.count / itemsPerPage);
        let view = req.query.partial ? "home/partial-items-view" : "home/index.pug";
        res.render(view, {
            title: "Home Server",
            items,
            pagedatas: {
                orderby: "",
                currentPage,
                itemsPerPage,
                totalPages,
                search: search,
                action: '/recents/',
                csrfToken: req.csrfToken(),
                step: req.step
            },
            isFile: true
        }, (err, html) => {
            if (err) console.log(err);

            if (req.query.partial) {
                res.send({ url: req.url, data: html });
            } else {
                res.send(html);
            }
        });
        console.timeEnd("rec")
        return null;
    }).catch(err => {
        console.log('fav-error', err);
    });
}

exports.postSearch = (req, res) => {
    let itemsPerPage = parseInt(req.body.items) || 1;
    let search = req.body.search || "";

    res.redirect(`/recents/1/${itemsPerPage}/${search}?partial=true`);
}


var removeFile = async(user, id) => {
    let file = await db.file.findOne({ where: { Id: id } });
    if (file) {
        await user.Recent.removeFile(file);
        return true;
    }
    return false;
}

exports.postRemoveFile = (req, res) => {

    return removeFile(req.user, req.body.itemId).then((result) => {
        return res.send({ result });
    }).catch(err => {
        console.log('fav-error', err);
    });
}