
process.on("message",(data)=>{
    console.log("from test");
    process.send(data);
});


console.log("from test 2");