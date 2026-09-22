import * as THREE from '../../vendor/three.module.js';
import { mergeGeometries } from '../../vendor/BufferGeometryUtils.js';
import { mat } from './materials.js';
export const animated = [];
export function rng(seed=4711) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t=Math.imul(seed ^ seed>>>15,1|seed); t=t+Math.imul(t ^ t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
export let random=rng();
export function resetSceneState(){animated.length=0;random=rng();}
export function mesh(parent, geometry, material, x=0,y=0,z=0, shadow=true) {
 const m=new THREE.Mesh(geometry,material); m.position.set(x,y,z); m.castShadow=shadow;m.receiveShadow=true; parent.add(m);return m;
}
const boxGeometry=new THREE.BoxGeometry(1,1,1);
export function box(p,m,x,y,z,w,h,d,shadow=true){const o=mesh(p,boxGeometry,m,x,y,z,shadow);o.scale.set(w,h,d);return o;}
export function cylinder(p,m,x,y,z,rt,rb,h,n=10,shadow=true){return mesh(p,new THREE.CylinderGeometry(rt,rb,h,n),m,x,y,z,shadow);}
export function rock(p,x,y,z,sx,sy,sz,m=mat.stone){const o=mesh(p,new THREE.IcosahedronGeometry(1,1),m,x,y,z);o.scale.set(sx,sy,sz);o.rotation.set(random()*.3,random()*6.28,random()*.25);return o;}
export function beam(p,m,a,b,r=.06){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),v=bv.clone().sub(av);const o=cylinder(p,m,...av.clone().add(bv).multiplyScalar(.5).toArray(),r,r,v.length(),7);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o;}
export function tube(p,m,points,r=.05){return mesh(p,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(v=>new THREE.Vector3(...v))),32,r,5,false),m);}
export function sway(p,x,y,z,amount=.03,speed=.8){const g=new THREE.Group();g.position.set(x,y,z);g.userData.dynamic=true;p.add(g);animated.push({g,amount,speed,phase:random()*6.28});return g;}
export function paper(p,x,y,z,scale=1){const g=sway(p,x,y,z,.055);const shape=new THREE.Shape();shape.moveTo(-.1,0);shape.lineTo(.15,0);shape.lineTo(.04,-.24);shape.lineTo(.20,-.24);shape.lineTo(-.01,-.58);shape.lineTo(-.20,-.58);shape.lineTo(-.05,-.32);shape.lineTo(-.22,-.32);shape.closePath();const o=mesh(g,new THREE.ShapeGeometry(shape),mat.paper);o.scale.setScalar(scale);return g;}
export function sacredRope(p,x,y,z,width){tube(p,mat.rope,[ [x-width/2,y,z],[x-width*.25,y-.2,z],[x,y-.32,z],[x+width*.25,y-.2,z],[x+width/2,y,z]],.095);for(let i=0;i<5;i++)paper(p,x+(i-2)*width/6,y-.25,z+.025,.85);}
export function lantern(p,x,y,z,scale=1){const g=sway(p,x,y,z,.025);g.scale.setScalar(scale);beam(g,mat.dark,[0,0,0],[0,-.3,0],.024);const b=mesh(g,new THREE.SphereGeometry(.31,12,8),mat.glow,0,-.63,0,false);b.scale.y=1.22;for(let i=0;i<5;i++){const ring=mesh(g,new THREE.TorusGeometry(.30*Math.sin((i+1)/6*Math.PI),.012,4,12),mat.wood,0,-.27-(i+1)*.12,0,false);ring.rotation.x=Math.PI/2;}cylinder(g,mat.dark,0,-.28,0,.16,.16,.08);cylinder(g,mat.dark,0,-.99,0,.15,.15,.08);return g;}
export function roof(p,x,y,z,w,d,rise=2){
 // A solid curved gable, open eaves, ridge caps and tile strips.
 const shape=new THREE.Shape();const profile=[];
 for(let i=0;i<=32;i++){const u=-1+i/16;profile.push([u*w/2,y+rise*Math.pow(1-Math.abs(u),1.5)+.28*Math.pow(Math.abs(u),8)]);}
 shape.moveTo(...profile[0]);for(const pt of profile.slice(1))shape.lineTo(...pt);for(const pt of [...profile].reverse())shape.lineTo(pt[0],pt[1]-.19);shape.closePath();
 const o=mesh(p,new THREE.ExtrudeGeometry(shape,{depth:d,bevelEnabled:false,steps:1}),mat.roof,x,0,z-d/2);
 for(const zz of [z-d/2-.03,z+d/2+.03])tube(p,mat.roofEdge,profile.map(([xx,yy])=>[xx+x,yy,zz]),.11);
 for(let i=0;i<=28;i++){const u=-1+i/14,yy=y+rise*Math.pow(1-Math.abs(u),1.5)+.28*Math.pow(Math.abs(u),8);beam(p,mat.roofEdge,[x+u*w/2,yy+.035,z-d/2],[x+u*w/2,yy+.035,z+d/2],.028);}
 box(p,mat.roofEdge,x,y+rise+.13,z,.34,.26,d+.35);
 for(const zz of [z-d/2,z+d/2]){box(p,mat.gold,x,y+rise+.18,zz,.4,.13,.12);}
 return o;
}
export function stoneLantern(p,x,z,scale=1){const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(scale);p.add(g);box(g,mat.stone,0,.12,0,.9,.24,.9);cylinder(g,mat.stone,0,.65,0,.16,.25,.95,6);box(g,mat.stone,0,1.13,0,.65,.14,.65);box(g,mat.glow,0,1.43,0,.35,.42,.35,false);for(const a of [-1,1])for(const b of [-1,1])box(g,mat.stone,a*.25,1.42,b*.25,.12,.5,.12);const top=cylinder(g,mat.stone,0,1.79,0,.18,.66,.28,4);top.rotation.y=Math.PI/4;rock(g,0,2,0,.13,.18,.13);}
export function batchStatic(root){
 root.updateMatrixWorld(true);const buckets=new Map(),remove=[];
 root.traverse(o=>{if(!o.isMesh||o.isInstancedMesh)return;let a=o;while(a){if(a.userData.dynamic)return;a=a.parent;}
 const key=o.material.uuid+':'+o.castShadow; if(!buckets.has(key))buckets.set(key,{material:o.material,shadow:o.castShadow,geos:[]});
 let geo=o.geometry.clone();geo.applyMatrix4(o.matrixWorld);if(geo.index)geo=geo.toNonIndexed();geo.deleteAttribute('uv');buckets.get(key).geos.push(geo);remove.push(o);});
 for(const o of remove)o.removeFromParent();for(const b of buckets.values()){const merged=mergeGeometries(b.geos);const o=mesh(root,merged,b.material,0,0,0,b.shadow);o.name='static-batch';for(const g of b.geos)g.dispose();}
}
