import * as T from '../vendor/three.module.js';
import {FighterRig,pose,enemyPose} from '../rig.js';
import {lockHands} from '../arm-lock.js';
import {showFists} from '../punch.js';
import {updateViewVisibility} from '../viewmodel.js';
const renderer=new T.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.25));renderer.setSize(innerWidth,innerHeight);document.body.append(renderer.domElement);renderer.setScissorTest(true);
function stage(){const scene=new T.Scene();scene.background=new T.Color('#20342c');scene.add(new T.HemisphereLight(0xffecd0,0x43594c,2.5));const light=new T.DirectionalLight(0xffddb2,2);light.position.set(-2,4,4);scene.add(light);return scene;}
const scene=stage(),other=stage(),rig=new FighterRig(),enemy=new FighterRig(0x587f73);scene.add(rig.root);other.add(enemy.root);
const cam=new T.PerspectiveCamera(76,innerWidth/2/innerHeight,.03,20),external=new T.PerspectiveCamera(42,innerWidth/2/innerHeight,.03,20);rig.root.position.set(0,-1.67,-.32);external.position.set(2,1.8,-3);external.lookAt(0,1.15,0);
const slider=document.getElementById('time'),mirror=document.getElementById('mirror'),play=document.getElementById('play');let playing=false,last=0;
play.onclick=()=>{playing=!playing;play.textContent=playing?'暂停':'播放';};slider.oninput=()=>{playing=false;play.textContent='播放';};
function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;if(playing)slider.value=(Number(slider.value)+dt)%.85;
 const side=mirror.checked?1:0,t=Number(slider.value),a={type:'armLock',side,t},p=pose(0,0,a);for(const s of ['L','R']){p[s+'elbow'][0]*=1.2;p[s+'elbow'][1]-=.08;p[s+'wrist'][1]-=.08;}
 rig.setHands(.95,.95);rig.set(p);showFists(rig,p,a,null);lockHands(rig,a);updateViewVisibility(rig,a);
 const q=pose(0,0,{type:'palm',side,t:.17}),e={armLock:{pose:q,side:side?'R':'L',t}};enemy.set(enemyPose(e));
 const width=innerWidth/2,height=innerHeight;renderer.setViewport(0,0,width,height);renderer.setScissor(0,0,width,height);renderer.render(scene,cam);renderer.setViewport(width,0,width,height);renderer.setScissor(width,0,width,height);renderer.render(other,external);requestAnimationFrame(frame);
}requestAnimationFrame(frame);
window.onresize=()=>{renderer.setSize(innerWidth,innerHeight);cam.aspect=external.aspect=innerWidth/2/innerHeight;cam.updateProjectionMatrix();external.updateProjectionMatrix();};
