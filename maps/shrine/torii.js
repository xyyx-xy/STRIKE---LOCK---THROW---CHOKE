import * as THREE from '../../vendor/three.module.js';
import {box,cylinder,tube,sacredRope} from './components.js';import {mat} from './materials.js';
export function createTorii(scene,world){const g=new THREE.Group();g.position.z=13.8;scene.add(g);
 for(const x of [-3.7,3.7]){cylinder(g,mat.red,x,2.6,0,.24,.32,5.2,12);cylinder(g,mat.dark,x,.28,0,.36,.4,.56,12);cylinder(g,mat.stone,x,.08,0,.48,.5,.16,10);world.circle(x,13.8,.4,0,5.4);}
 box(g,mat.red,0,4.28,0,8.7,.34,.36);box(g,mat.red,0,5.25,0,9.6,.34,.55);
 tube(g,mat.dark,[[-5,5.55,0],[-3.7,5.48,0],[0,5.42,0],[3.7,5.48,0],[5,5.55,0]],.18);
 for(const x of [-3.7,0,3.7])box(g,mat.red,x,4.77,0,.23,.8,.26);
 sacredRope(g,0,4.12,.16,6.6);
}
