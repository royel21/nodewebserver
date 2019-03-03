const { screenShots, screenShots2 } = require('./fluent-ffmpeg-test');

const work = async () => {

    await screenShots('D:\\Anime\\Absolute Duo\\Absolute Duo 01.mp4', './');
    await screenShots2('D:\\Anime\\Absolute Duo\\Absolute Duo 01.mp4', './');

}
work();