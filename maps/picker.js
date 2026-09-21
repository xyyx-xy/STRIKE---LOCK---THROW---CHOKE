import {MAPS} from './registry.js';

export function mountMapPicker(currentId,onChange){
  const entry=document.createElement('button');entry.type='button';entry.className='map-open';entry.id='map-open';
  entry.innerHTML='<span>选择试炼场 <small>SELECT ARENA</small></span><strong></strong><span aria-hidden="true">↗</span>';
  const dialog=document.createElement('dialog');dialog.className='arena-dialog';dialog.setAttribute('aria-labelledby','arena-title');
  dialog.innerHTML=`<div class="arena-top"><span>打極投絞 / ARENAS</span><button type="button" class="arena-close" aria-label="关闭选图">✕</button></div>
    <h2 id="arena-title">择地，开战。</h2><p class="arena-intro">每一处场地，都是一场新的交锋。</p>
    <div class="arena-layout"><div class="arena-cards" aria-label="可选地图"></div><aside class="arena-detail"><span class="arena-kicker">场地档案</span><h3></h3><p class="arena-description"></p><div class="arena-tags"></div><p class="arena-rule">切换场地将重开试炼。<br>你的招式、按键与画质设置会保留。</p></aside></div>
    <div class="arena-bottom"><span role="status" class="arena-status"></span><button type="button" class="arena-enter">进入地图 →</button></div>`;
  document.body.append(dialog);document.querySelector('.preferences').before(entry);
  let selected=currentId;const cards=new Map();
  const status=dialog.querySelector('.arena-status');
  function render(){
    const map=MAPS[selected];dialog.querySelector('.arena-detail h3').textContent=map.name;
    dialog.querySelector('.arena-description').textContent=map.description||'在这处场地展开打击试炼。';
    const tags=dialog.querySelector('.arena-tags');tags.replaceChildren();
    for(const text of(map.tags||['打击试炼'])){const tag=document.createElement('span');tag.textContent=text;tags.append(tag);}
    for(const [id,card]of cards){card.setAttribute('aria-pressed',String(id===selected));card.querySelector('.arena-badge').textContent=id===selected?'已选择':'可选择';}
    status.textContent=`${Object.keys(MAPS).length} 处可用场地 · ${selected===currentId?'当前地图':'待进入'}`;
    entry.querySelector('strong').textContent=MAPS[currentId].name;
  }
  for(const [id,map]of Object.entries(MAPS)){
    const card=document.createElement('button');card.type='button';card.className='arena-card';
    const image=document.createElement('div');image.className='arena-preview';
    if(map.thumbnail){const img=document.createElement('img');img.src=map.thumbnail;img.alt=map.name+'场景预览';image.append(img);}
    const badge=document.createElement('span');badge.className='arena-badge';image.append(badge);
    const caption=document.createElement('div');caption.className='arena-caption';const name=document.createElement('strong');name.textContent=map.name;
    const sub=document.createElement('span');sub.textContent=map.subtitle||'打击试炼';caption.append(name,sub);card.append(image,caption);
    card.onclick=()=>{selected=id;render();};cards.set(id,card);dialog.querySelector('.arena-cards').append(card);
  }
  entry.onclick=()=>{selected=currentId;render();dialog.showModal();};
  const close=()=>{dialog.close();entry.focus();};dialog.querySelector('.arena-close').onclick=close;
  dialog.addEventListener('click',e=>{if(e.target===dialog)close();});
  dialog.addEventListener('keydown',e=>e.stopPropagation());
  dialog.querySelector('.arena-enter').onclick=()=>{
    if(selected!==currentId){onChange(selected);currentId=selected;}
    try{localStorage.setItem('da-ji-tou-jiao.map',currentId);}catch{}
    render();dialog.close();document.getElementById('start').click();
  };
  render();
}
