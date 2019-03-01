const { screenShots, screenShots2 } = require('./fluent-ffmpeg-test');

const work = async () => {

    await screenShots('D:\\Programming\\Webdev\\Angular\\Angular 2 Tutorial #1 - Introduction.mp4', './');
    await screenShots2('D:\\Programming\\Webdev\\Angular\\Angular 2 Tutorial #1 - Introduction.mp4', './');

}
work();