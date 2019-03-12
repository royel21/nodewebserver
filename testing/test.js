const db = require('../models');



const loadVideos = async (caId, A) => {
    let val = "";
    let begin = 0;
    let itemsPerPage = 18;

    let cat = await db.category.findOne({ where: { Id: caId } });
    let videos = {count: 0, rows: []};
    if (A) {
        console.time('s')
        let vis = await cat.getVideos();
        let visId = vis.map(c => c.Id);
        if (visId.length === 0) visId.push('')
        videos = await db.video.findAndCountAll({
            order: ['NameNormalize'],
            attributes: ['Id', 'Name'],
            where: {
                [db.Op.and]: [{
                    [db.Op.not]: { Id: visId },
                    Name: {
                        [db.Op.like]: "%" + val + "%"
                    }
                }]
            },
            offset: begin,
            limit: itemsPerPage,
        });
        console.timeEnd('s')
        console.log("All",videos.rows.length)
    }
    else {
        let vis = await cat.getVideos({
            order: ['NameNormalize'],
            attributes: ['Id', 'Name'],
            where: {
                Name: {
                    [db.Op.like]: "%" + val + "%"
                }
            }
        });
        videos.rows = vis.slice(begin, itemsPerPage)
        videos.count = vis.length;
        console.log("cat V:",videos.rows.length)
    }
}

db.init().then(() => {
    // console.log("\n\n\n\n\n\n\n\n");
    loadVideos('cqrz1').catch(err => {
        console.log(err)
    })
   
});