$(document).on("click",".user-form",(e)=>{
    console.log("clicked")
    var tr = e.target.closest('tr');
    var uid = tr ? tr.id : "";
    
    $.get("/admin/user-modal",{uid},(resp)=>{
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
        console.log(resp)
        if(resp.err){
            console.log(resp.err);
        }else{
            if($('tbody tr').length < 5){
                $('tbody').append(resp);
            }
            hideForm();
        }
    });
});
