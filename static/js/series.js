var loadVideoSeries;
var getId;
var getAction;

//load videos for current admin page
if(!loadVideoSeries){
    getId = (e) =>  $(e.target).closest('.controls').parent()[0].id;
    getAction = (e) => $(e.target).closest('.controls').parent().data('action');
    
    loadVideoSeries = (data, container) => {
        let selectedSerie = $('#series-list .active')[0];

        data.serieId = selectedSerie ? selectedSerie.id : "";
        data.isAllVideo = false;
        let url = $('#container').data('action') + container;
        console.log(url)
        $.get(url, data, (resp, status) => {
            $('#'+container).replaceWith(resp);
        });
    }
}


//select a item from the list and load his video
$('.content-list li').click((e) => {
    let li = e.target.tagName.includes('LI') ? e.target : e.target.closest('li');
    $('.content-list li').removeClass("active");
    $(li).addClass('active');

    loadVideoSeries({}, 'videos-list');
});