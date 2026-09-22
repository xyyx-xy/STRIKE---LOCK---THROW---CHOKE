import * as THREE from '../../vendor/three.module.js';import {mat} from './materials.js';import {box,mesh,group} from './geometry.js';
const FONT='"Hiragino Kaku Gothic ProN","Yu Gothic",sans-serif';
function canvasTexture(canvas){const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=4;return tex;}
function canvas(w=1024,h=576){const c=document.createElement('canvas');c.width=w;c.height=h;return[c,c.getContext('2d')];}
function txt(c,text,x,y,size,color,weight=800){c.fillStyle=color;c.font=`${weight} ${size}px ${FONT}`;c.fillText(text,x,y);}
const themes={
 lunar:{bg:'#161e48',fg:'#fbe2df',accent:'#ec84b5',title:'月波',latin:'TSUKINAMI',sub:'AFTER HOURS / NEW SOUNDS',id:'01'},
 cyan:{bg:'#0b4365',fg:'#e8ffff',accent:'#74e5ec',title:'蒼井',latin:'AOI WAVE',sub:'THE CITY IS YOUR STAGE',id:'02'},
 amber:{bg:'#613b35',fg:'#fff1d4',accent:'#ffbd73',title:'灯街',latin:'AKARI MARKET',sub:'GOOD FOOD. LATE NIGHTS.',id:'03'},
 violet:{bg:'#36375f',fg:'#f0e9ff',accent:'#a6a0f3',title:'空音',latin:'SORANE',sub:'LISTEN BEYOND / 24:00',id:'04'},
};
function adTexture(theme,alternate=false){const [cv,c]=canvas(),t=themes[theme];c.fillStyle=t.bg;c.fillRect(0,0,1024,576);
 c.save();c.translate(768,255);
 if(theme==='lunar'){
  c.strokeStyle=t.accent;c.lineWidth=2;for(let r=160;r<340;r+=29){c.beginPath();c.arc(0,0,r,0,Math.PI*2);c.stroke();}
  const grad=c.createLinearGradient(-150,-160,180,180);grad.addColorStop(0,t.fg);grad.addColorStop(.5,t.accent);grad.addColorStop(1,t.bg);c.fillStyle=grad;c.beginPath();c.arc(0,0,alternate?162:180,0,Math.PI*2);c.fill();
  c.rotate(-.35);c.strokeStyle=t.fg;c.lineWidth=12;c.beginPath();c.ellipse(0,0,248,50,0,0,Math.PI*2);c.stroke();
 }else if(theme==='cyan'){
  c.rotate(-.24);for(let i=0;i<15;i++){c.beginPath();c.strokeStyle=i%4===0?t.fg:t.accent;c.lineWidth=i%4===0?5:2;for(let x=-200;x<=260;x+=3){let y=Math.sin(x*.019+i*.19+(alternate?.8:0))*96+i*16-105;x===-200?c.moveTo(x,y):c.lineTo(x,y);}c.stroke();}
  c.strokeStyle=t.fg;c.lineWidth=3;c.strokeRect(-155,-190,305,380);
 }else if(theme==='amber'){
  c.fillStyle=t.accent;c.beginPath();c.arc(0,5,183,0,Math.PI*2);c.fill();
  c.strokeStyle=t.bg;c.lineWidth=21;c.beginPath();c.arc(105,10,46,-1.6,1.6);c.stroke();
  c.fillStyle=t.bg;c.beginPath();c.roundRect(-99,-68,196,171,[8,8,54,54]);c.fill();
  c.strokeStyle=t.fg;c.lineWidth=7;for(let i=-1;i<=1;i++){c.beginPath();c.moveTo(i*42,-99);c.bezierCurveTo(i*42-30,-127,i*42+30,-155,i*42,-178);c.stroke();}
  c.fillStyle=t.fg;c.fillRect(-116,121,235,9);
 }else{
  c.rotate(-.12);c.strokeStyle=t.accent;c.lineWidth=37;c.beginPath();c.arc(0,-15,146,Math.PI,0);c.stroke();
  c.fillStyle=t.fg;for(const x of [-155,111]){c.beginPath();c.roundRect(x,-19,44,136,18);c.fill();}
  c.strokeStyle=t.accent;c.lineWidth=5;for(let i=0;i<19;i++){let h=25+Math.sin(i*1.6)*18;c.beginPath();c.moveTo(-91+i*10,60-h);c.lineTo(-91+i*10,60+h);c.stroke();}
  c.strokeStyle=t.fg;c.lineWidth=1;for(let r=205;r<285;r+=20){c.beginPath();c.arc(0,0,r,0,Math.PI*2);c.stroke();}
 }c.restore();
 txt(c,alternate?'夜を、歩こう。':t.title,48,alternate?190:215,alternate?55:136,t.fg);
 txt(c,t.latin,52,292,52,t.accent);txt(c,t.sub,54,347,18,t.fg,500);
 c.fillStyle=t.accent;c.fillRect(52,406,285,3);txt(c,alternate?'MIDNIGHT EDITION':'A NEW CITY FREQUENCY',54,445,17,t.fg,500);
 txt(c,'AOI DISTRICT / '+t.id,54,536,16,t.accent,500);txt(c,'◯',920,534,44,t.fg);
 // Low-contrast scan lines are baked once, never redrawn each frame.
 c.fillStyle='#ffffff08';for(let y=0;y<576;y+=5)c.fillRect(0,y,1024,1);return canvasTexture(cv);}
export class Signage{
 constructor(){this.screens=[];this.labels=new Map();this.textures=[];}
 billboard(parent,x,y,z,w,h,theme='lunar',rotation=0){const g=group(parent,x,y,z,rotation),a=adTexture(theme),b=adTexture(theme,true);this.textures.push(a,b);const fade={value:0},pulse={value:1};
  const material=new THREE.MeshBasicMaterial({map:a,toneMapped:false});material.onBeforeCompile=shader=>{shader.uniforms.uAlt={value:b};shader.uniforms.uFade=fade;shader.uniforms.uPulse=pulse;shader.fragmentShader='uniform sampler2D uAlt; uniform float uFade; uniform float uPulse;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>','diffuseColor *= mix(texture2D(map, vMapUv),texture2D(uAlt,vMapUv),uFade); diffuseColor.rgb *= uPulse;');};material.customProgramCacheKey=()=> 'billboard-crossfade';
  box(g,mat.black,0,0,-.12,w+.35,h+.35,.26);mesh(g,new THREE.PlaneGeometry(w,h),material,0,0,.025,false);
  for(const xx of [-w/2-.11,w/2+.11])box(g,mat.metal,xx,0,0,.06,h,.06,false);
  const phase=this.screens.length*2.1;this.screens.push({fade,pulse,phase});return g;
 }
 label(parent,text,x,y,z,w,h,{bg='#152c45',color='#def6ff',rotation=0,accent=null}={}){const key=[text,bg,color,w/h].join('|');let material=this.labels.get(key);if(!material){const [cv,c]=canvas(1024,Math.max(128,Math.round(1024*h/w)));c.fillStyle=bg;c.fillRect(0,0,cv.width,cv.height);c.textAlign='center';c.textBaseline='middle';const size=Math.min(cv.height*.63,cv.width/(text.length*.66));txt(c,text,512,cv.height*.52,size,color);if(accent){c.fillStyle=accent;c.fillRect(0,0,12,cv.height);}material=new THREE.MeshBasicMaterial({map:canvasTexture(cv),toneMapped:false});this.labels.set(key,material);}const g=group(parent,x,y,z,rotation);box(g,mat.black,0,0,-.08,w+.14,h+.13,.19);mesh(g,new THREE.PlaneGeometry(w,h),material,0,0,.025,false);return g;
 }
 update(t){for(const s of this.screens){const phase=(t+s.phase)%32;const ease=x=>x*x*(3-2*x);s.fade.value=phase<13?0:phase<16?ease((phase-13)/3):phase<29?1:1-ease((phase-29)/3);s.pulse.value=.975+Math.sin(t*.75+s.phase)*.025;}}
}
