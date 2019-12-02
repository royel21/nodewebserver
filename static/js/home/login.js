$(()=>{
    let folderid = localStorage.getItem('folder');
    if(folderid){
        $('#folderid').val(folderid)
    }else{
        localStorage.setItem('folder','false');
    }
    
    $('#screenw').val(window.screen.width);
});