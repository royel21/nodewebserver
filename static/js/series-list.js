$('body').on('click', '.items', (e)=>{
   let id = e.target.classList[0].includes('items') ? e.target.id : e.target.closest('.items').id
   console.log(id);
});