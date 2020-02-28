window.onload = (e) => {
    document.querySelector('#screenw').value = window.screen.width;
    document.querySelector('#screenh').value = document.body.offsetHeight;
    document.querySelector('#returnurl').value = localStorage.getItem('lasturl');
    window.history.pushState({}, "Log In", "/login");
    window.onpopstate = function(e) {
        history.go(-(history.length - 2));
    }
}