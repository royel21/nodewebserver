const http = require('http');
const { fork } = require('child_process');

const server = http.createServer();

server.on('request', (req, res) => {
    console.log(req.url)
  if (req.url === '/compute') {
    const compute = fork('child.js');
    compute.send({msg: 'start calculation', other: "jaja"});
    compute.on('message', sum => {
      res.end(`Sum is ${sum}`);
      console.log("sum")
    });
  } else {
    res.end('Ok')
  }
});

server.listen(3000);
