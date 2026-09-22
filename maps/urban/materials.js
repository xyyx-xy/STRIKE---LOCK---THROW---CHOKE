import * as THREE from '../../vendor/three.module.js';
const ramp=new THREE.DataTexture(new Uint8Array([95,155,205,255]),4,1,THREE.RedFormat);ramp.minFilter=ramp.magFilter=THREE.NearestFilter;ramp.needsUpdate=true;
export const toon=(color,extra={})=>new THREE.MeshToonMaterial({color,gradientMap:ramp,...extra});
export const glow=(color)=>new THREE.MeshBasicMaterial({color,toneMapped:false});
export const mat={
 concrete:toon('#677588'),stone:toon('#9aabc0'),dark:toon('#17263a'),black:toon('#0d1625'),metal:toon('#3e5063'),
 building:[toon('#3a4f68'),toon('#657588'),toon('#354a64'),toon('#536177'),toon('#6b7e94')],
 glass: new THREE.MeshStandardMaterial({color:'#1e354b',roughness:.29,metalness:.58}),
 asphalt:new THREE.MeshStandardMaterial({color:'#465365',roughness:.64,metalness:.08}),
 paint:new THREE.MeshStandardMaterial({color:'#d6e3e9',roughness:.61,metalness:.06}),
 yellow:toon('#dcae59'),window:glow('#a1c6da'),windowWarm:glow('#dfbe8d'),cyan:glow('#46dfef'),pink:glow('#eb609d'),
 amber:glow('#ffb65d'),white:glow('#e1f3ff'),red:glow('#ee575b'),green:glow('#58e0ac'),blue:glow('#768de7'),
};

// A tiny procedural asphalt grain is generated locally; no image download is needed.
export function prepareMaterials(){
if(!mat.asphalt.map){
const grainCanvas=document.createElement('canvas');grainCanvas.width=grainCanvas.height=128;
const grainContext=grainCanvas.getContext('2d'),grain=grainContext.createImageData(128,128);
let noiseSeed=729;for(let i=0;i<grain.data.length;i+=4){noiseSeed=(noiseSeed*1664525+1013904223)>>>0;const v=205+(noiseSeed>>>27);grain.data[i]=grain.data[i+1]=grain.data[i+2]=v;grain.data[i+3]=255;}grainContext.putImageData(grain,0,0);
const grainMap=new THREE.CanvasTexture(grainCanvas);grainMap.wrapS=grainMap.wrapT=THREE.RepeatWrapping;grainMap.repeat.set(70,70);grainMap.colorSpace=THREE.SRGBColorSpace;grainMap.anisotropy=4;mat.asphalt.map=grainMap;

}
for(const material of Object.values(mat).flat()){material.needsUpdate=true;for(const value of Object.values(material))if(value?.isTexture)value.needsUpdate=true;}
}
