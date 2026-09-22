import * as THREE from '../../vendor/three.module.js';import {mat} from './materials.js';import {mesh,box,random} from './components.js';
export function createArena(scene){
 const ground=mesh(scene,new THREE.CircleGeometry(83,100),mat.soil,0,-.045,0,false);ground.rotation.x=-Math.PI/2;
 const arena=mesh(scene,new THREE.CircleGeometry(8.5,96),mat.earth,0,.005,0,false);arena.rotation.x=-Math.PI/2;
 const geo=new THREE.IcosahedronGeometry(1,1),stones=new THREE.InstancedMesh(geo,mat.stone,112),o=new THREE.Object3D();
 for(let i=0;i<112;i++){const angle=i/112*Math.PI*2;const rr=8.58+(random()-.5)*.28;o.position.set(Math.sin(angle)*rr,.09,Math.cos(angle)*rr);o.rotation.set(random()*.3,random()*6.28,random()*.3);o.scale.set(.21+random()*.19,.12+random()*.1,.2+random()*.16);o.updateMatrix();stones.setMatrixAt(i,o.matrix);stones.setColorAt(i,new THREE.Color().setHSL(.18+random()*.05,.09,.42+random()*.17));}stones.receiveShadow=true;scene.add(stones);
 for(let z=9;z<26;z+=1.15)for(let j=-1;j<=1;j++){const p=box(scene,mat.stoneLight,j*.92,.025,z+(random()-.5)*.07,.87,.07,1.06,false);p.rotation.y=(random()-.5)*.035;}
 for(let z=-9;z>-12;z-=1.1)for(let j=-1;j<=1;j++)box(scene,mat.stoneLight,j*.92,.035,z,.88,.08,1.01,false);
 // Tiny flush gravel: decorative only, never a movement collider.
 const grit=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1,0),mat.stoneLight,620);
 for(let i=0;i<620;i++){const a=random()*6.28,r=Math.sqrt(random())*8.2;o.position.set(Math.cos(a)*r,.014,Math.sin(a)*r);o.rotation.set(0,a,0);o.scale.set(.01+random()*.035,.006,.015+random()*.028);o.updateMatrix();grit.setMatrixAt(i,o.matrix);}scene.add(grit);
}
