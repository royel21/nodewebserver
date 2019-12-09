window.onload = (e) =>{
    document.querySelector('#screenw').value =  window.screen.width;
    window.history.pushState({},"Log In", "/login");
    window.onpopstate = function(e){
       history.go(-(history.length - 2));
    }
}