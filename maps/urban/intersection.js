import * as THREE from '../../vendor/three.module.js';import {mat} from './materials.js';import {box,mesh,random,group} from './geometry.js';
function crosswalk(scene,x,z,angle){const g=group(scene,x,0,z,angle);for(let i=-8;i<=8;i++)box(g,mat.paint,i*.98,.012,0,.56,.014,3.5,false);box(g,mat.paint,0,.013,2.55,18,.018,.19,false);}
function arrow(scene,x,z,angle){const g=group(scene,x,0,z,angle);box(g,mat.paint,0,.013,0,.18,.014,2,false);const s=new THREE.Shape();s.moveTo(-.65,-.2);s.lineTo(0,-1.2);s.lineTo(.65,-.2);s.lineTo(.14,-.35);s.lineTo(-.14,-.35);s.closePath();const m=mesh(g,new THREE.ShapeGeometry(s),mat.paint,0,.026,-.7,false);m.rotation.x=-Math.PI/2;}
export function createIntersection(scene,world){box(scene,mat.asphalt,0,-.13,0,112,.24,112,false);
 crosswalk(scene,0,-10.5,0);crosswalk(scene,0,10.5,Math.PI);crosswalk(scene,-10.5,0,Math.PI/2);crosswalk(scene,10.5,0,-Math.PI/2);
 for(const sign of [-1,1])for(let v=16;v<35;v+=4.3){box(scene,mat.paint,sign*4,.008,v, .13,.012,1.8,false);box(scene,mat.paint,sign*4,.008,-v,.13,.012,1.8,false);box(scene,mat.paint,v,.008,sign*4,1.8,.012,.13,false);box(scene,mat.paint,-v,.008,sign*4,1.8,.012,.13,false);}
 for(const sign of [-1,1]){box(scene,mat.yellow,sign*.1,.008,25,.06,.012,19,false);box(scene,mat.yellow,sign*.1,.008,-25,.06,.012,19,false);box(scene,mat.yellow,25,.008,sign*.1,19,.012,.06,false);box(scene,mat.yellow,-25,.008,sign*.1,19,.012,.06,false);}
 arrow(scene,-2,18,0);arrow(scene,2,-18,Math.PI);arrow(scene,18,2,Math.PI/2);arrow(scene,-18,-2,-Math.PI/2);
 // Four continuous sidewalks. The curb is a real low solid; it cannot be walked through.
 for(const sx of [-1,1])for(const sz of [-1,1]){const x=sx*26,z=sz*26;box(scene,mat.concrete,x,.09,z,28,.2,28,false);world.box(x,z,28,28,0,.19);world.platform(x,z,28,28,.20);
  // Sidewalk access is by jumping up the low curb; platforms only engage once above it.
  for(let p=12;p<40;p+=1.2){box(scene,mat.stone,sx*12,.13,sz*(p+.6),.2,.26,1.14,false);box(scene,mat.stone,sx*(p+.6),.13,sz*12,1.14,.26,.2,false);world.box(sx*12,sz*(p+.6),.2,1.2,0,.26);world.box(sx*(p+.6),sz*12,1.2,.2,0,.26);}
  for(let a=13;a<38;a+=2.5)for(let b=13;b<38;b+=2.5){box(scene,mat.metal,sx*a,.201,sz*b,.022,.005,2.45,false);box(scene,mat.metal,sx*a,.201,sz*b,2.45,.005,.022,false);}
  for(let p=13;p<23;p+=.5)box(scene,mat.yellow,sx*p,.21,sz*13,.36,.015,.34,false);
 }
 // Flush manholes with visible concentric cast-metal pattern.
 for(const [x,z] of [[-5,3],[5,-4],[3,23],[-22,-3]]){const disc=mesh(scene,new THREE.CircleGeometry(.43,24),mat.metal,x,.012,z,false);disc.rotation.x=-Math.PI/2;for(const r of [.3,.4]){const ring=mesh(scene,new THREE.RingGeometry(r,r+.017,24),mat.black,x,.019,z,false);ring.rotation.x=-Math.PI/2;}for(let i=-2;i<=2;i++)box(scene,mat.black,x+i*.11,.021,z,.025,.009,.48,false);}
 for(let i=0;i<80;i++){const x=(random()-.5)*22,z=(random()-.5)*22;if(i%5===0)box(scene,mat.metal,x,.006,z,.2+random()*.6,.005,.013,false);}
}
// Colored wet-asphalt glints: camera-dependent Fresnel opacity, no heavy reflection pass.
export function createRoadReflections(scene){const reflections=[];for(const [x,z,color,w,h] of [[-9,-13,'#cf629b',4,10],[9,-13,'#55c8ea',4,9],[-13,7,'#c49254',3,8],[13,7,'#6d82cd',3,7],[-4,-29,'#8fbfd4',3,6]]){
 const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{tint:{value:new THREE.Color(color)},time:{value:0}},vertexShader:'varying vec2 vUv;varying vec3 vWorld;void main(){vUv=uv;vec4 w=modelMatrix*vec4(position,1.);vWorld=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',fragmentShader:`uniform vec3 tint;uniform float time;varying vec2 vUv;varying vec3 vWorld;void main(){vec2 p=vUv*2.-1.;float edge=pow(max(0.,1.-dot(p,p)),2.);float band=.62+.38*sin(vUv.y*110.+sin(vUv.x*40.)*2.);float fresnel=pow(1.-abs(normalize(cameraPosition-vWorld).y),2.);gl_FragColor=vec4(tint,edge*band*fresnel*.19);}`});const plane=mesh(scene,new THREE.PlaneGeometry(w,h),material,x,.032,z,false);plane.rotation.x=-Math.PI/2;plane.userData.dynamic=true;reflections.push(material);}return reflections;}
