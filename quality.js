import * as T from './vendor/three.module.js';
export const QUALITY_PRESETS={
  veryLow:{label:'超低',pixelRatio:.65,samples:0,shadow:0},
  low:{label:'低',pixelRatio:.85,samples:0,shadow:512},
  medium:{label:'中',pixelRatio:1.25,samples:2,shadow:1024},
  high:{label:'高',pixelRatio:1.7,samples:4,shadow:2048},
  ultra:{label:'超高',pixelRatio:2,samples:4,shadow:4096}
};
export function loadQuality(storage){try{const key=storage.getItem('da-ji-tou-jiao.quality');return Object.hasOwn(QUALITY_PRESETS,key)?key:'medium';}catch{return 'medium';}}
export function applyQuality(id,renderer,composite,scene,width,height,dpr=1){
  const preset=QUALITY_PRESETS[id]||QUALITY_PRESETS.medium;
  renderer.setPixelRatio(Math.min(dpr,preset.pixelRatio));renderer.setSize(width,height);
  const shadowChanged=renderer.shadowMap.enabled!==(preset.shadow>0);
  renderer.shadowMap.enabled=preset.shadow>0;renderer.shadowMap.type=T.PCFSoftShadowMap;
  scene.traverse(o=>{
    if(o.isLight&&o.shadow&&o.castShadow){
      const size=Math.min(preset.shadow||512,renderer.capabilities.maxTextureSize);
      if(o.shadow.mapSize.x!==size){o.shadow.map?.dispose();o.shadow.map=null;o.shadow.mapPass?.dispose();o.shadow.mapPass=null;o.shadow.mapSize.set(size,size);o.shadow.needsUpdate=true;}
    }
    if(shadowChanged&&o.material)for(const m of(Array.isArray(o.material)?o.material:[o.material]))m.needsUpdate=true;
  });
  const samples=Math.min(preset.samples,renderer.capabilities.maxSamples);
  if(composite.rt.samples!==samples){composite.rt.dispose();composite.rt.samples=samples;}
  composite.resize();renderer.shadowMap.needsUpdate=true;
  return preset;
}
export function mountQualityPicker(id,onChange){
  const label=document.createElement('label');label.className='quality-setting';label.textContent='画质';
  const select=document.createElement('select');select.id='quality-select';select.setAttribute('aria-label','画质');
  for(const [value,preset]of Object.entries(QUALITY_PRESETS)){const o=document.createElement('option');o.value=value;o.textContent=preset.label;select.append(o);}
  select.value=id;const message=document.createElement('small');message.setAttribute('role','status');message.textContent='修改立即生效并自动保存；不影响伤害与动作。';
  select.onchange=()=>{onChange(select.value);try{localStorage.setItem('da-ji-tou-jiao.quality',select.value);message.textContent='已自动保存 · '+QUALITY_PRESETS[select.value].label;}catch{message.textContent='本次生效；浏览器不允许保存';}};
  label.append(select,message);document.querySelector('.preferences').append(label);
}
