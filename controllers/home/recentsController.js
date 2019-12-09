const db = require('../../models');

var getRecentFiles = async(user, data) => {
    console.time("rc");

    let files = { count: 0, rows: [] };

    if (user.Role.includes('admin')) return files;

    let recent = await user.getRecent();
    files.rows = await recent.getFiles({
        attributes: [
            'Id', 'Name', 'DirectoryId', 'Type', 'Duration', [db.sqlze.literal("(Select FileId from FavoriteFiles where FileId == File.Id and FavoriteId == '" + user.Favorite.Id + "')"), "isFav"],
            [db.sqlze.literal("RecentFiles.LastPos"), 'CurrentPos']
        ],
        joinTableAttributes: ['LastRead', 'LastPos'],
        order: [
            [db.sqlze.literal("RecentFiles.LastRead"), 'DESC']
        ],
        offset: data.begin,
        limit: data.itemsPerPage,
        where: {
            [db.Op.and]: [{
                Name: {
                    [db.Op.like]: "%" + data.search + "%"
                }
            }]
        }
    });
    files.count = await db.recentFile.count({ where: { RecentId: recent.Id } });
    console.timeEnd("rc");
    return files;
}

exports.recent = (req, res) => {

    let screenw = parseInt(req.cookies['screen-w']);
    let itemsPerPage = parseInt(req.params.items || req.query.items) || req.itemsPerPage;
    let currentPage = parseInt(req.params.page) || 1;
    let begin = ((currentPage - 1) * itemsPerPage) || 0;
    let search = req.params.search || "";

    getRecentFiles(req.user, { begin, itemsPerPage, search }).then(items => {
        var totalPages = Math.ceil(items.count / itemsPerPage);
        let view = req.query.partial ? "home/partial-items-view" : "home/index.pug";
        res.render(view, {
            title: "Home Server",
            items,
            pagedatas: {
                currentPage,
                itemsPerPage,
                totalPages,
                search: search,
                action: '/recents/',
                csrfToken: req.csrfToken(),
                step: (screenw < 1900 ? 7 : 9)
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

    return removeFile(req.user, req.body.id).then((result) => {
        return res.send({ result });
    }).catch(err => {
        console.log('fav-error', err);
    });
}