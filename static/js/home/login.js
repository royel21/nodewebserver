$(()=>{
    let serieid = localStorage.getItem('serie');
    if(serieid){
        $('#serieid').val(serieid)
    }else{
        localStorage.setItem('serie','false');
    }
    
    $('#screenw').val(window.screen.width);
});