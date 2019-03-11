const db = require('../models');

db.init().then(() => {
    console.log("\n\n\n\n\n\n\n\n");
    console.time("start");
    db.category.findById('tex0c').then(cat=>{
        cat.getVideos().then(vis=>{
            let visId = vis.map(c=> c.Id);
            console.log(visId);
            db.video.findAll({
                attributes: ['Id', 'Name'],
                where:{[db.Op.not]:{Id:visId}}
            }).then(videos => {
                console.log(videos.length);
                console.timeEnd("start");
            });
        })
    });
    
    
});