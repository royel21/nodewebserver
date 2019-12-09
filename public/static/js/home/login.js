window.onload = (e) =>{
    document.querySelector('#screenw').value =  window.screen.width;
    window.history.pushState(null,null,null);
    window.onpopstate = function(e){
       history.go(-(history.length - 2));
    }
}