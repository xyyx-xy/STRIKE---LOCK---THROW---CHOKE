import * as THREE from '../../vendor/three.module.js';
export function createLighting(scene){scene.add(new THREE.HemisphereLight('#98b8f2','#273449',2.0));const moon=new THREE.DirectionalLight('#a2bcf4',1.5);moon.position.set(-18,36,17);moon.target.position.set(0,0,0);moon.castShadow=true;moon.shadow.mapSize.set(2048,2048);Object.assign(moon.shadow.camera,{left:-34,right:34,top:34,bottom:-34,near:1,far:120});moon.shadow.intensity=.45;moon.shadow.bias=-.00015;moon.shadow.normalBias=.07;scene.add(moon,moon.target);
 // Four unshadowed local lights are the complete per-pixel neon lighting budget.
 for(const [x,z,color] of [[-14,-13,'#f084b6'],[14,-13,'#5adbed'],[-14,13,'#ffc886'],[14,13,'#858eff']]){const l=new THREE.PointLight(color,95,27,2);l.position.set(x,6,z);scene.add(l);}return moon;}
