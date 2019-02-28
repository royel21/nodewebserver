
process.on("test-message",(path, id, socketId)=>{
    process.send("folder-scanned", {id, socketid});
});