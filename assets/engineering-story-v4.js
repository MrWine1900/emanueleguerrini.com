(()=>{'use strict';
const gallery=document.getElementById('eg-steam-gallery');
const tabs=[...document.querySelectorAll('[data-system]')];
function syncGallery(){
 if(!gallery)return;
 const steam=tabs.find(x=>x.dataset.system==='steam');
 gallery.hidden=steam?.getAttribute('aria-selected')!=='true';
}
tabs.forEach(tab=>{
 tab.addEventListener('click',()=>requestAnimationFrame(syncGallery));
 tab.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft')requestAnimationFrame(syncGallery)});
});
syncGallery();
})();