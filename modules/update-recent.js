const db = require('../models');

module.exports.updateRecent = async(data, user) => {
    if (!data.id) return;
    console.log(data)

    let recent = await db.recentFile.findOrCreate({ where: { FileId: data.id, RecentId: user.Recent.Id } });

    if (!recent[0].isNewRecord) {
        await recent[0].update({ LastRead: new Date(), LastPos: data.pos || 0 });
    }
}