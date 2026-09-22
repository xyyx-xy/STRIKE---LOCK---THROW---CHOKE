import * as THREE from '../../vendor/three.module.js';import {mat} from './materials.js';import {random,rock,beam,cylinder,paper,tube} from './components.js';
class Instances {constructor(scene,geo,material){this.scene=scene;this.geo=geo;this.material=material;this.items=[];}add(x,y,z,sx,sy,sz,ry=0){this.items.push([x,y,z,sx,sy,sz,ry]);}finish(shadow=false){const m=new THREE.InstancedMesh(this.geo,this.material,this.items.length),o=new THREE.Object3D();this.items.forEach((v,i)=>{o.position.set(...v.slice(0,3));o.scale.set(...v.slice(3,6));o.rotation.y=v[6];o.updateMatrix();m.setMatrixAt(i,o.matrix);});m.castShadow=shadow;m.receiveShadow=true;this.scene.add(m);return m;}}
export function createVegetation(scene,world){
 const trunks=new Instances(scene,new THREE.CylinderGeometry(.65,1,1,7),mat.bark),cedars=new Instances(scene,new THREE.ConeGeometry(1,1,9),mat.cedar),leaves=new Instances(scene,new THREE.IcosahedronGeometry(1,1),mat.leaf),lightLeaves=new Instances(scene,new THREE.IcosahedronGeometry(1,1),mat.leafLight),maples=new Instances(scene,new THREE.IcosahedronGeometry(1,1),mat.maple);
 for(let i=0;i<190;i++){const a=random()*6.28,r=20+random()*35,x=Math.sin(a)*r,z=Math.cos(a)*r-6;if(Math.abs(x)<7&&z>10)continue;
 const h=8+random()*10,rad=.28+random()*.28;trunks.add(x,h/2,z,rad,h,rad);if(r<30)world.circle(x,z,rad,0,h);
 if(i%3){for(let j=0;j<4;j++)cedars.add(x,h*.52+j*h*.13,z,2.7-j*.43,h*.5,2.7-j*.43,random());}
 else for(let j=0;j<5;j++){const l=i%11===0?maples:(j%2?leaves:lightLeaves);l.add(x+(random()-.5)*4,h-1+random()*2,z+(random()-.5)*4,2.3+random(),1.2+random(),2.4+random());}
 }
 // Ancient sacred tree: tapered trunk, spreading roots and an asymmetrical crown.
 const tx=-13,tz=-7;trunks.add(tx,4.5,tz,1.3,9,1.3);world.circle(tx,tz,1.4,0,14);
 for(let i=0;i<7;i++){const a=i/7*6.28;beam(scene,mat.bark,[tx,.65,tz],[tx+Math.cos(a)*2.5,.05,tz+Math.sin(a)*2.5],.23);const ex=tx+Math.cos(a)*3,ez=tz+Math.sin(a)*2.4;beam(scene,mat.bark,[tx,5.5,tz],[ex,8.7,ez],.33);for(let j=0;j<3;j++)lightLeaves.add(ex+(random()-.5)*2,9+j*.65,ez+(random()-.5)*2,2.8,1.55,2.6);}
 const loop=[];for(let i=0;i<=32;i++){const a=i/32*6.28;loop.push([tx+Math.cos(a)*1.14,2.35+Math.sin(a)*.08,tz+Math.sin(a)*1.14]);}tube(scene,mat.rope,loop,.1);for(let i=0;i<7;i++){const a=i/7*6.28;const p=paper(scene,tx+Math.cos(a)*1.2,2.3,tz+Math.sin(a)*1.2,.9);p.rotation.y=Math.PI/2-a;}
 // A single orange maple frames the approach without occupying the arena.
 trunks.add(-8.9,2.7,8, .28,5.4,.28);world.circle(-8.9,8,.32,0,7);for(let i=0;i<12;i++)maples.add(-9+(random()-.5)*5,4.8+random()*2,8+(random()-.5)*4,1.7,.65,1.5);
 const bamboo=new Instances(scene,new THREE.CylinderGeometry(.075,.09,1,6),mat.moss),nodes=new Instances(scene,new THREE.CylinderGeometry(.1,.1,.045,6),mat.leafLight);
 for(let i=0;i<43;i++){const x=-18+random()*4,z=-10+random()*18,h=5+random()*4;bamboo.add(x,h/2,z,1,h,1);for(let y=.5;y<h;y+=.75)nodes.add(x,y,z,1,1,1);leaves.add(x+.35,h*.7,z,.8,.12,.6);leaves.add(x-.3,h*.85,z,.7,.1,.7);world.circle(x,z,.1,0,h);}
 bamboo.finish();nodes.finish();trunks.finish(true);cedars.finish(true);leaves.finish(true);lightLeaves.finish(true);maples.finish(true);
 const grassGeo=new THREE.BufferGeometry();grassGeo.setAttribute('position',new THREE.Float32BufferAttribute([-.09,0,0, .09,0,0, .04,.6,.035, 0,0,-.09,0,0,.09,.04,.45,.01],3));grassGeo.computeVertexNormals();const grasses=new Instances(scene,grassGeo,mat.grass),shrubs=new Instances(scene,new THREE.IcosahedronGeometry(1,0),mat.leafLight),moss=new Instances(scene,new THREE.CircleGeometry(1,7),mat.moss);
 for(let i=0;i<4200;i++){const x=(random()-.5)*51,z=(random()-.5)*57,r=Math.hypot(x,z);if(r<8.8||Math.abs(x)<2&&z>7||Math.abs(x)<7&&z<-10&&z>-21||x>8&&x<18&&z>-10&&z<9||x<-10&&x>-15&&z>2&&z<6)continue;grasses.add(x,0,z,.4+random()*.65,.25+random()*.65,.5+random(),random()*6.28);if(i%25===0&&r>11)shrubs.add(x,.3,z,.5+random(),.3+random()*.4,.5+random());}
 grasses.finish();shrubs.finish();
 // Moss breaks up the perimeter stones, while the combat surface stays flat.
 for(let i=0;i<75;i++){const a=random()*6.28,r=8.35+random()*.5;rock(scene,Math.cos(a)*r,.11,Math.sin(a)*r,.16,.03,.12,mat.moss);}
 for(let i=0;i<20;i++){const a=i/20*6.28;rock(scene,Math.sin(a)*46,2,Math.cos(a)*48-8,10,7+random()*9,10,mat.cedar);}
}
