


// // Replace name on modal for serie
// $('#cover').change((e) => {
//     $('#f-name').text(e.target.files[0].name)
// });


// //Submit Serie Entry for edit or create
// $('#series-create-edit').submit((e) => {
//     e.preventDefault();
//     var formData = new FormData(e.target);
//     $.ajax({
//         url: '/admin/series/modal-post',
//         type: 'POST',
//         data: formData,
//         contentType: false,
//         processData: false,
//         success: function (resp) {
//             if (resp.err) {
//                 console.log(resp.message);
//             } else {
//                 $('#series-list ul').append(resp);
//                 if ($('#series-list li').length === 12) {
//                     $('#series-list li:first').addClass('active');
//                     loadVideoSeries({});
//                 }
//                 hideForm();
//             }
//         }
//     });
// });




// $('#items-container').on('click','#search-videos .clear-search', (e) => {
//     $('#search-videos .search-input').val('');
//     loadVideoSeries({}, getId(e));
// });

// $('#items-container').on('change', '#select-page', (e) => {

//     let data = { page: $('#page-select').val(), search: $('#search-input').val() };
//     loadVideoSeries(data, getId(e));
// });





// //Remove Serie Entry list
// $('.content-list li .remove').click((e) => {
//     let action = getAction().split('/')[2];
//     console.log(id);
//     let li = e.target.closest('li');

// //     $.post(getAction() + 'delete-'+action, { name: $(li).text().trim(), id: li.id, _csrf: $('#container').data('csrf') }, (resp) => {
// //         console.log(resp);
// //         if (resp.state !== "err") {
// //             $(li).fadeOut('fast', (e) => {
// //                 li.remove();
// //                 let $li = $('#series li:first');
// //                 if ($li[0]) {
// //                     $('#series li:first').addClass('active');
                    
// //                 }
// //             });
// //         }
// //     });
// });
