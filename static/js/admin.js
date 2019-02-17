$(document).on("click",".user-form",(e)=>{
    console.log("clicked")
    var tr = e.target.closest('tr');
    var uid = tr ? tr.id : "";
    
    $.get("admin/user-modal",{uid},(resp)=>{
        $('body').prepend(resp);
        $('#modal').fadeIn();
    });
});

hideForm = ()=>{
    $('#modal-container').fadeOut(()=>{
        $('#modal-container').remove();
    });
}

$(document).on("click",".close-modal",hideForm);

$(document).on('submit', '#create-edit',(e)=>{
    e.preventDefault();
    var $form = $('#create-edit');
    $.post($form.attr('action'), $form.serialize(),(resp)=>{
        if(resp.error){
            console.log(resp.error);
        }else{
            $('tbody').prepend(resp);
            hideForm();
        }
    });
});
