$(() => {
    console.log('Test')
    $.get('/screen-width?screenw=' + window.screen.width, (resp) => { 
        console.log(resp)
    });
});