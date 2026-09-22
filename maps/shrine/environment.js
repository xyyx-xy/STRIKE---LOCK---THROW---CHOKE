import * as THREE from '../../vendor/three.module.js';import {mat} from './materials.js';import {box,cylinder,rock,roof,beam,tube,paper,lantern,stoneLantern,sway,random} from './components.js';
function pavilion(scene,world){const g=new THREE.Group();g.position.set(-12,0,4);scene.add(g);box(g,mat.stone,0,.12,0,4.5,.24,3.5);
 for(const x of [-1.8,1.8])for(const z of [-1.25,1.25]){box(g,mat.wood,x,1.7,z,.19,3.4,.19);world.box(x-12,z+4,.22,.22,0,3.5);}roof(g,0,3.15,0,5.3,4.1,1.1);
 box(g,mat.stone,0,.55,0,2.6,.9,1.45);box(g,mat.water,0,1.01,0,2.1,.02,1.05,false);for(const x of [-1.2,1.2])box(g,mat.stoneLight,x,1,0,.22,.26,1.5);for(const z of [-.66,.66])box(g,mat.stoneLight,0,1,z,2.6,.26,.2);
 for(const x of [-.8,.55]){beam(g,mat.woodLight,[x,1.22,-.8],[x,1.22,.8],.035);cylinder(g,mat.woodLight,x,1.24,.6,.12,.11,.17,10);}world.box(-12,4,2.65,1.55,0,1.3);
 beam(g,mat.moss,[-1.6,1.4,-.4],[.2,1.4,-.4],.07);tube(g,mat.water,[[.2,1.4,-.4],[.23,1.2,-.4],[.23,1.03,-.4]],.018);
}
function cottage(scene,world){const g=new THREE.Group();g.position.set(12.5,0,-6);scene.add(g);box(g,mat.stone,0,.22,0,5.8,.44,4.5);box(g,mat.wood,0,1.75,0,5.2,2.8,4);roof(g,0,3.2,0,6.9,5.5,1.4);world.box(12.5,-6,5.8,4.5,0,5);
 for(let i=0;i<23;i++)box(g,mat.woodLight,-2.53+i*.23,1.5,2.025,.035,2.3,.06);
 for(const x of [-1.65,1.65]){box(g,mat.paper,x,2.05,2.07,1.1,1.3,.03);for(let j=0;j<5;j++)box(g,mat.wood,x-.5+j*.25,2.05,2.12,.05,1.4,.055);box(g,mat.wood,x,2.1,2.12,1.15,.07,.06);}
 box(g,mat.dark,0,1.55,2.08,1.2,2.35,.1);for(const x of [-.42,0,.42])box(g,mat.woodLight,x,1.55,2.15,.055,2.3,.04);box(g,mat.woodLight,0,.32,2.6,6,.15,1);lantern(g,2.1,3,2.5,.75);
}
function racks(scene,world){
 const g=new THREE.Group();g.position.set(11,0,1.4);scene.add(g);for(const x of [-1.5,1.5])box(g,mat.wood,x,1.3,0,.15,2.6,.16);roof(g,0,2.55,0,3.7,.9,.35);
 for(const y of [.9,1.55,2.15]){box(g,mat.woodLight,0,y,0,3.1,.08,.09);for(let i=0;i<7;i++){const a=sway(g,-1.23+i*.41,y-.04,.05,.035,1.05);beam(a,mat.rope,[0,0,0],[0,-.15,0],.013);const s=new THREE.Shape();s.moveTo(-.15,-.18);s.lineTo(0,-.09);s.lineTo(.15,-.18);s.lineTo(.15,-.4);s.lineTo(-.15,-.4);s.closePath();a.add(new THREE.Mesh(new THREE.ShapeGeometry(s),mat.woodLight));box(a,mat.red,0,-.28,.008,.055,.06,.01,false);}}
 world.box(11,1.4,3.2,.3,0,2.8);
 const x=14.6,z=2.5;for(const xx of [x-1.2,x+1.2]){box(scene,mat.red,xx,1.1,z,.13,2.2,.13);world.box(xx,z,.16,.16,0,2.2);}for(const y of [.9,1.5,2]){beam(scene,mat.rope,[x-1.2,y,z],[x+1.2,y,z],.022);for(let i=0;i<9;i++){const p=paper(scene,x-1.05+i*.26,y,z,.34);p.rotation.z=random()*.5;}}
 // A blank wooden notice board, as requested: no text appears anywhere.
 for(const xx of [9.8,11.1])box(scene,mat.wood,xx,1,5.3,.13,2,.13);box(scene,mat.woodLight,10.45,1.7,5.3,1.7,1,.13);roof(scene,10.45,2.3,5.3,2.1,.7,.3);world.box(10.45,5.3,1.8,.3,0,2.7);
}
function fox(scene,x,z){const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);box(g,mat.stone,0,.17,0,.95,.34,.9);rock(g,0,.72,0,.29,.55,.3,mat.stoneLight);rock(g,0,1.17,.1,.26,.24,.24,mat.stoneLight);const snout=cylinder(g,mat.stoneLight,0,1.12,.32,.03,.15,.35,5);snout.rotation.x=Math.PI/2;
 for(const xx of [-.16,.16]){const ear=cylinder(g,mat.stoneLight,xx,1.43,.06,0,.13,.35,4);ear.rotation.z=-xx;box(g,mat.dark,xx*.82,1.2,.3,.035,.038,.025,false);rock(g,xx,.4,.19,.09,.21,.14,mat.stoneLight);}tube(g,mat.stoneLight,[[0,.45,-.15],[.3,.55,-.35],[.4,.92,-.28],[.3,1.08,-.2]],.12);box(g,mat.red,0,.94,.25,.34,.27,.045);}
function fence(scene,world,x,z,length,axis='x'){const count=Math.ceil(length/1.5);for(let i=0;i<=count;i++){let xx=x+(axis==='x'?i*length/count:0),zz=z+(axis==='z'?i*length/count:0);box(scene,mat.wood,xx,.95,zz,.16,1.9,.16);}for(const y of [.65,1.35])box(scene,mat.wood,x+(axis==='x'?length/2:0),y,z+(axis==='z'?length/2:0),axis==='x'?length:.12,.12,axis==='z'?length:.12);world.box(x+(axis==='x'?length/2:0),z+(axis==='z'?length/2:0),axis==='x'?length:.2,axis==='z'?length:.2,0,2);}
export function createEnvironment(scene,world){pavilion(scene,world);cottage(scene,world);racks(scene,world);
 for(const [x,z,s] of [[-5.4,10,1.1],[5.4,10,1.1],[-6.7,-10,1.3],[6.7,-10,1.3],[-14,-4,.9]]){stoneLantern(scene,x,z,s);world.circle(x,z,.48*s,0,2.2*s);}
 for(const x of [-4,4]){fox(scene,x,-11.3);world.box(x,-11.3,1,1,0,1.7);}
 for(const [x,z] of [[16,-3],[16.5,-1.8],[9.7,-3.6]]){cylinder(scene,mat.woodLight,x,.45,z,.36,.31,.9,12);for(const y of [.15,.7]){const ring=new THREE.Mesh(new THREE.TorusGeometry(.35,.026,4,12),mat.dark);ring.rotation.x=Math.PI/2;ring.position.set(x,y,z);scene.add(ring);}world.circle(x,z,.38,0,1);}
 box(scene,mat.wood,16.2,.4,-6,1.3,.8,.85);box(scene,mat.dark,16.2,.82,-6,1.4,.08,.94);world.box(16.2,-6,1.4,1,0,1);
 beam(scene,mat.woodLight,[15.4,.15,-3.7],[15.8,1.8,-4],.025);const broom=cylinder(scene,mat.rope,15.4,.22,-3.7,.05,.21,.4,8);broom.rotation.z=-.2;
 fence(scene,world,17.5,-11,17,'z');fence(scene,world,7.5,-11,10);fence(scene,world,-8,24,5);fence(scene,world,3,24,5);
 const shrine=new THREE.Group();shrine.position.set(15,0,8);scene.add(shrine);box(shrine,mat.stone,0,.3,0,1.5,.6,1.4);box(shrine,mat.red,0,1.1,0,1,.95,.8);box(shrine,mat.dark,0,1.1,.42,.55,.7,.04);roof(shrine,0,1.65,0,1.9,1.5,.6);world.box(15,8,1.6,1.5,0,2.5);
 rock(scene,17,.8,6,.55,1.1,.35,mat.stone);world.circle(17,6,.6,0,2);
 // Shallow spring and stepping stones on the quiet western side.
 const pond=new THREE.Mesh(new THREE.CircleGeometry(2.6,24),mat.water);pond.rotation.x=-Math.PI/2;pond.scale.y=.56;pond.position.set(-15,.015,-1.2);scene.add(pond);
 for(let i=0;i<22;i++){const a=i/22*6.28;rock(scene,-15+Math.cos(a)*2.65,.1,-1.2+Math.sin(a)*1.5,.3,.18,.26);}for(let i=0;i<9;i++)rock(scene,-10.3-i*.45,.06,2-i*1.1,.44,.1,.5,mat.stoneLight);
 // Continuous visible boundary: overlapping boulders, backed by forest hills.
 for(let i=0;i<88;i++){const a=i/88*Math.PI*2,x=Math.sin(a)*24,z=Math.cos(a)*28-1;const sx=1.7+random()*.6,sz=1.6+random()*.6;
 rock(scene,x,.9,z,sx,1.7+random()*1.8,sz);world.circle(x,z,Math.min(sx,sz)*.89,0,8);rock(scene,x,.35,z,sx*.9,.45,sz*.9,mat.moss);}
}
