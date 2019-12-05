const db = require('../models');

var getRecentFiles = async (user, data) => {
    console.time("rc")
    let recent = await user.getRecent();
    let files = { count: 0, rows: [] };
    if (recent) {
        files.rows = await recent.getFiles({
            attributes: ['Id', 'Name', 'DirectoryId','Type'], 
            joinTableAttributes: ['LastRead'],
            order: [[db.sqlze.literal("RecentFile.LastRead"), 'DESC']],
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
        files.count = await db.recentFile.count({where:{ RecentId: recent.Id}});
    }
    console.timeEnd("rc")
    return files;
}

exports.recent = (req, res) => {

    let screenw = parseInt(req.cookies['screen-w']);
    let itemsPerPage = req.params.items || req.query.items || (screenw < 1900 ? 21 : 27);
    let currentPage = req.params.page || 1;
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

    }).catch(err => {
        console.log('fav-error', err);
    });
}

exports.postSearch = (req, res) => {
    let itemsPerPage = req.body.items;
    let search = req.body.search || "";

    res.redirect(`/recents/1/${itemsPerPage}/${search}?partial=true`);
}
