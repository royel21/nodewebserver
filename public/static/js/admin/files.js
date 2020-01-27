var loadFilesConfig = () => {
    $('body').off('submit', '#modal');

    $('body').on('submit', '#update-movie', (e) => {
        e.preventDefault();
        let $form = $(e.target);

        $.post($form.attr('action'), $form.serialize(), (resp) => {
            $('#' + resp.Id).find('td:nth-child(2) span').text(resp.Name);
            $form.remove();
            confirm(resp.Name + " Actualizado Con Exito", 'text-success');
        });
    });
}

$('#content').on('change','#table-controls #itemperpage, #table-controls #page-select', (el) => {
    let page = document.querySelector('select[name=page]').value;
    let iperpage = document.querySelector('select[name=items]').value;

    let url = location.pathname.split('/').slice(0,3).join('/');
    url = url+`/${page}/${iperpage}/`+ $('input[name=search]').val();
    loadPartialPage(url);
});