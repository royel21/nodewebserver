$(document).on("click", ".show-form", (e) => {

    let tr = e.target.closest('tr');
    let uid = tr ? tr.id : "";
    let action = $('#table-container').data('action');
    console.log(action, uid)
    $.get(action, { uid }, (resp) => {
        $('body').prepend(resp);
        $('#modal').fadeIn();
    });
});

hideForm = () => {
    $('#modal-container').fadeOut(() => {
        $('#modal-container').remove();
    });
}

$(document).on("click", ".close-modal", hideForm);

var confirm = (message) => {
    $('#create-edit').remove();
    $('#modal-header').addClass('text-success').text(message)
    $('#modal').append($('<div class="text-center mt-3"><button class="btn btn-primary">Close<div>'));
    $('#modal').on('click', 'button',(e)=>{
        hideForm();
    });
}

$(document).on('submit', '#create-edit', (e) => {
    e.preventDefault();
    var $form = $('#create-edit');
    $.post($form.attr('action'), $form.serialize(), (resp) => {
        console.log(resp)

        switch (resp.state) {
            case "error": {
                $('#errors').append($('<span>').text(resp.data));
                break;
            }
            case "update": {
                $('#' + $('input[name="id"]').val()).replaceWith($(resp.data));
                confirm("Usuario " + resp.name + " Actualizado Con Exito");
                break;
            }
            case "create": {
                if ($('tbody tr').length < 5) {
                    $('tbody').append(resp.data);
                }
                confirm("Usuario " + resp.name + " Agregado Con Exito");
                break;
            }
        }
    });
});
