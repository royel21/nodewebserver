const db = require('../models');



const loadVideos = async (caId, page, all) => {
    let val = "";
    let itemsPerPage = 10;
    let begin = ((page - 1) * itemsPerPage) | 1;
    let not = all ? "" : "not";
    let videos = { count: 0, rows: [] };
    let count = await db.sqlze.query(`Select count(*) as count 
    from Videos where Id ${not} in(Select VideoId from VideoCategories where CategoryId = ?)`, {
            replacements: [caId],
            type: db.sqlze.QueryTypes.SELECT
        });
    videos.count = count[0].count;
    videos.rows = await db.sqlze.query(`Select Id, Name, NameNormalize 
    from Videos where Id ${not} in(Select VideoId from VideoCategories where CategoryId = ?) limit ?, ?;`, {
            model: db.video,
            mapToModel: true,
            replacements: [caId, begin, itemsPerPage],
            type: db.sqlze.QueryTypes.SELECT
        });

    console.timeEnd('s')
    console.log('count:', videos.count, "\n\n\n")
    console.log("All", videos.rows.map(a => a.Name))
}

db.init().then(() => {
    // console.log("\n\n\n\n\n\n\n\n");
    loadVideos('6z1sg', 1, true).catch(err => {
        console.log(err)
    });
});

let not = allVideos ? "not" : "";
let count = await db.sqlze.query(`Select count(*) as count 
    from Videos where Name LIKE ? and Id ${not} in(Select VideoId from VideoCategories where CategoryId = ?)`,
    {
        replacements: [val, caId],
        type: db.sqlze.QueryTypes.SELECT
    });
videos.count = count[0].count;
videos.rows = await db.sqlze.query(`Select Id, Name, NameNormalize 
                                        from Videos where Name LIKE ? and Id ${not} in(Select VideoId 
                                        from VideoCategories where CategoryId = ?) 
                                        ORDER BY NameNormalize limit ?, ?;`,
    {
        model: db.video,
        mapToModel: true,
        replacements: [val, caId, begin, itemsPerPage],
        type: db.sqlze.QueryTypes.SELECT
    });