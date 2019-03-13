$('body').off('submit', '#modal');

$('body').on('submit', '#update-movie', (e)=>{
    e.preventDefault();
    let $form = $(e.target);
    console.log($form.data('action'), $form.serialize())
    $.post($form.attr('action'), $form.serialize(), (resp)=>{
           $('#'+resp.Id).find('td:nth-child(2) span').text(resp.Name);
            $form.remove();
            confirm(resp.Name + " Actualizado Con Exito", 'text-success');
    });
});