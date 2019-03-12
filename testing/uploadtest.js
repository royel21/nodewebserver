
const db = require('../models');

function NormalizeName(name, padding = 3) {
  name = name.replace(/.mp4|.mkv|.avi/ig, '');
  var res1 = name.split(/\d+/g);
  if (res1.length === 1) return name;
  var res2 = name.match(/\d+/g);
  var temp = "";
  if (res1 !== null && res2 !== null) {
    for (let [i, s] of res2.entries()) {
      temp += res1[i] + String(Number(s)).padStart(padding, 0);
    }
    temp = temp + res1[res1.length - 1];
  }
  return temp;
}


db.init().then(() => {
  console.log("\n\n\n");
  console.time('s')
  let vId = "2dpdl";
  let catId = '6z1sg';

  let name = 'One PIece - Ova 5.mp4';
  let newName = 'One Piece - Ova 5.mp4';
  db.video.update(
    { Name: newName, NameNormalize: NormalizeName(newName) },
    { where: { Name: name } }
  )
});