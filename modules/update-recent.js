
const db = require('../models');

module.exports.updateRecent = async (user, id) => {
    let file = await db.file.findByPk(id);
    if (file) {
        let recent = await db.recentFile.findOrCreate({ where: { FileId: id, RecentId: user.Recent.Id } });
        if (!recent[0].isNewRecord) {
            await recent[0].update({ LastRead: new Date() });
        }
    }
}

