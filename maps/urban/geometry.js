import * as THREE from '../../vendor/three.module.js';import {mergeGeometries} from '../../vendor/BufferGeometryUtils.js';
export function seeded(seed=2407){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
export let random=seeded();
export function resetRandom(){random=seeded();}
const cube=new THREE.BoxGeometry(1,1,1),pole=new THREE.CylinderGeometry(1,1,1,8);
export function mesh(parent,geometry,material,x=0,y=0,z=0,shadow=true){const o=new THREE.Mesh(geometry,material);o.position.set(x,y,z);o.castShadow=shadow;o.receiveShadow=true;parent.add(o);return o;}
export function box(p,m,x,y,z,w,h,d,shadow=true){const o=mesh(p,cube,m,x,y,z,shadow);o.scale.set(w,h,d);return o;}
export function cylinder(p,m,x,y,z,r,h,shadow=true){const o=mesh(p,pole,m,x,y,z,shadow);o.scale.set(r,h,r);return o;}
export function beam(p,m,a,b,r=.05){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),delta=bv.clone().sub(av);const o=cylinder(p,m,...av.clone().add(bv).multiplyScalar(.5).toArray(),r,delta.length());o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return o;}
export function group(p,x=0,y=0,z=0,rotation=0){const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=rotation;p.add(g);return g;}
export class Instances{
 constructor(geometry,material){this.geometry=geometry;this.material=material;this.items=[];}
 add(x,y,z,w,h,d,rotation=0,color=null){this.items.push({x,y,z,w,h,d,rotation,color});}
 finish(scene,shadow=false){if(!this.items.length)return;const mesh=new THREE.InstancedMesh(this.geometry,this.material,this.items.length),dummy=new THREE.Object3D();this.items.forEach((v,i)=>{dummy.position.set(v.x,v.y,v.z);dummy.scale.set(v.w,v.h,v.d);dummy.rotation.set(0,v.rotation,0);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);if(v.color)mesh.setColorAt(i,new THREE.Color(v.color));});mesh.castShadow=shadow;mesh.receiveShadow=true;scene.add(mesh);return mesh;}
}
export function batchStatic(scene){scene.updateMatrixWorld(true);const buckets=new Map(),remove=[];scene.traverse(o=>{if(!o.isMesh||o.isInstancedMesh)return;let p=o;while(p){if(p.userData.dynamic)return;p=p.parent;}const key=o.material.uuid+':'+o.castShadow;let b=buckets.get(key);if(!b){b={material:o.material,shadow:o.castShadow,geos:[]};buckets.set(key,b);}let geo=o.geometry.clone().applyMatrix4(o.matrixWorld);if(geo.index)geo=geo.toNonIndexed();if(!o.material.map)geo.deleteAttribute('uv');b.geos.push(geo);remove.push(o);});for(const o of remove)o.removeFromParent();for(const b of buckets.values()){const merged=mergeGeometries(b.geos);if(merged)mesh(scene,merged,b.material,0,0,0,b.shadow);for(const g of b.geos)g.dispose();}}
