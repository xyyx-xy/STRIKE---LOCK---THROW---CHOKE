import * as THREE from '../../vendor/three.module.js';import {mat} from './materials.js';import {box,cylinder,beam,roof,sacredRope,lantern,sway,tube} from './components.js';
export function createShrine(scene,world){const g=new THREE.Group();g.position.z=-16.5;scene.add(g);
 box(g,mat.stone,0,.5,0,12,1,7);box(g,mat.dark,0,1.04,0,12.3,.18,7.3);
 world.box(0,-16.5,12,7,0,.98);world.platform(0,-16.5,12.3,7.3,1.13);
 for(let i=0;i<5;i++){const h=(i+1)*.215,z=5.4-i*.46;box(g,mat.stoneLight,0,h/2,z,4.8,h,.5);world.platform(0,z-16.5,4.8,.5,h);}
 for(let i=0;i<31;i++)box(g,mat.wood,0,1.16,-3.5+i*.23,12,.09,.21);
 box(g,mat.wall,0,2.9,-.65,10,3.5,4.5);world.box(0,-17.15,10,4.5,1.13,6);
 for(const x of [-5,-2.55,2.55,5]){box(g,mat.red,x,3.2,1.67,.26,4.1,.3);box(g,mat.red,x,3.2,-2.9,.26,4.1,.3);}
 for(const zz of [-2.95,1.65])for(const y of [1.45,2,4.2,4.72])box(g,mat.red,0,y,zz,10.5,.18,.24);
 for(const x of [-5.07,5.07]){
  for(let i=0;i<18;i++)box(g,mat.wood,x,1.7,-2.65+i*.24,.12,1.1,.16);
  box(g,mat.dark,x,3.1,-.55,.15,1.3,2);for(let z=-1.45;z<.5;z+=.24)box(g,mat.woodLight,x*1.01,3.1,z,.13,1.3,.065);
  for(const y of [2.5,3.1,3.7])box(g,mat.woodLight,x*1.012,y,-.55,.12,.065,2.1);
 }
 for(const x of [-1.02,1.02]){box(g,mat.dark,x,2.8,1.81,1.95,3,.13);for(let j=0;j<7;j++)box(g,mat.woodLight,x-.78+j*.26,2.8,1.9,.07,2.8,.08);box(g,mat.gold,x*.13,2.8,1.99,.08,.3,.06);}
 // Engawa balustrades and brackets, with an open stair entrance.
 for(const x of [-5.7,5.7]){for(const zz of [-3,0,3])box(g,mat.red,x,1.8,zz,.18,1.4,.18);for(const y of [1.5,2.3])box(g,mat.red,x,y,0,.16,.14,6.2);}
 for(const sign of [-1,1]){for(let j=0;j<5;j++)box(g,mat.red,sign*(2.65+j*.65),1.8,3.2,.1,1.1,.1);box(g,mat.red,sign*4,2.35,3.2,3.15,.14,.2);}
 for(const x of [-5.4,-2.6,2.6,5.4]){box(g,mat.red,x,3.3,2.9,.24,4.25,.24);beam(g,mat.red,[x,4.3,2.9],[x,5,2],.13);box(g,mat.woodLight,x,4.8,2.9,.62,.2,.56);}
 box(g,mat.red,0,5,2.9,11.8,.28,.35);box(g,mat.wood,0,5,-.2,11.8,.32,7.4);
 roof(g,0,5.25,-.2,14.2,9.3,2.5);
 // White gable fascia with warm wooden truss visible under the front eave.
 const triangle=new THREE.Shape();triangle.moveTo(-5,5.18);triangle.lineTo(0,7.25);triangle.lineTo(5,5.18);triangle.closePath();
 const fascia=new THREE.Mesh(new THREE.ShapeGeometry(triangle),mat.wall);fascia.position.z=3.8;g.add(fascia);
 beam(g,mat.red,[-5,5.18,3.85],[0,7.25,3.85],.1);beam(g,mat.red,[0,7.25,3.85],[5,5.18,3.85],.1);box(g,mat.red,0,6.02,3.87,.14,1.9,.13);box(g,mat.red,0,5.65,3.87,5,.12,.12);
 sacredRope(g,0,4.4,3.12,6.9);for(const x of [-4.3,4.3])lantern(g,x,4.7,3.35,1.0);
 const bell=sway(g,0,4.28,3.3,.015);cylinder(bell,mat.gold,0,-.15,0,.14,.25,.32,12);cylinder(bell,mat.dark,0,-.32,0,.26,.26,.05);
 const rope=sway(g,0,3.93,3.3,.025,.65);tube(rope,mat.rope,[[0,0,0],[.02,-.7,.03],[-.02,-1.6,0],[0,-2.3,.02]],.055);cylinder(rope,mat.red,0,-2.32,0,.09,.09,.2);cylinder(rope,mat.rope,0,-2.5,0,.06,.14,.22);
 box(g,mat.woodLight,0,1.62,2.5,2.3,.85,.86);box(g,mat.dark,0,2.06,2.5,2.5,.12,1);for(let i=0;i<12;i++)box(g,mat.woodLight,-1.1+i*.2,2.14,2.5,.08,.06,.9);for(const x of [-1,1])box(g,mat.gold,x,1.64,2.95,.1,.65,.06);world.box(0,-14,2.4,1,1.13,2.2);
 for(const sign of [-1,1]){world.box(sign*5.7,-16.5,.25,6.4,1.13,2.45);world.box(sign*4,-13.3,3.2,.25,1.13,2.45);for(const x of [sign*2.6,sign*5.4])world.box(x,-13.6,.28,.28,1.13,5.4);}
}
