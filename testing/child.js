
  
  process.on('message', (msg) => {
      
    process.send("answer");
    if(msg === 'close'){
        console.log("child:", msg)
        process.exit();
    }else{
      console.log("child:", msg)
    }
  });