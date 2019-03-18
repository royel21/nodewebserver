$(()=>{
    let serieid = localStorage.getItem('serie');
    if(serieid){
        $('#serieid').val(serieid)
    }
    
    $('#screenw').val(window.screen.width);
});