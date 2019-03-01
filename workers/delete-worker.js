const fs = require('fs-extra');

process.on("message",(pathToDelete)=>{
    if (!["c:\\", "C:\\", "/"].includes(pathToDelete))
    {
        fs.removeSync(pathToDelete);
        process.send(true);
    }else{
        process.send(false);
    }
});