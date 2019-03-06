const gisearch = require('google-images')
var engine = new gisearch()
engine.search('ranma', (err, images)=>{
    images.writeTo('./ranma.jpg');
});