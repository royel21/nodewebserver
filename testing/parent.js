const http = require('http');
const { fork } = require('child_process');

const compute = fork('child.js');
compute.send({msg: 'start calculation', other: "jaja"});
compute.on('message', result => { 
  console.log(result);
});

compute.on('close',()=>{
  console.log("child close");
});

var count = 0;
const inter = setInterval(()=>{
    count++;
    if(count > 10){
      
      compute.send("close");
      clearInterval(inter);
    }
    console.log(count);
    compute.send("more work");
},1000);