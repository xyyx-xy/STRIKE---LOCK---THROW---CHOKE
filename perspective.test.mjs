import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from './vendor/three.module.js';
import {Perspective,orbitOffset,updateCameraKeys,mouseAim} from './perspective.js';
import {createState} from './combat.js';
test('overview toggles full body, clamps zoom/tilt and keeps attack aim separate',()=>{
 const scene=new T.Scene(),view=new Perspective(scene),camera=new T.PerspectiveCamera(),p={x:0,z:0,yaw:.7,pitch:.2},s=createState();
 assert.equal(view.toggle(),true);view.zoom(-1e5);assert.equal(view.distance,2.6);view.zoom(1e5);assert.equal(view.distance,16);
 view.tilt(50);assert.equal(view.elevation,1.35);view.tilt(-50);assert.equal(view.elevation,.18);
 view.update(camera,scene,p,s,0,{},true);assert.equal(p.pitch,.2);assert.ok(view.body.root.visible);assert.ok(view.body.ends.head.visible);
 assert.ok(view.body.parts.every(part=>part.mesh.visible));assert.ok(Math.abs(camera.position.distanceTo(view.target)-16)<1e-8);
 view.toggle();view.update(camera,scene,p,s,0,{},true);assert.equal(view.body.root.visible,false);
 assert.ok(Math.abs(orbitOffset(2,.7,6).length()-6)<1e-8);
});
test('overview retracts before ceiling, restores requested distance after switching maps',()=>{
 const scene=new T.Scene(),root=new T.Scene(),view=new Perspective(scene),camera=new T.PerspectiveCamera();
 const ceiling=new T.Mesh(new T.BoxGeometry(30,.2,30),new T.MeshBasicMaterial());ceiling.position.y=3;root.add(ceiling);scene.add(root);
 view.toggle();view.update(camera,scene,{x:0,z:0,yaw:0,pitch:0},createState(),0,{},true);
 assert.ok(view.visibleDistance<6);assert.ok(camera.position.y<2.9);assert.equal(view.distance,6);
 scene.remove(root);view.update(camera,scene,{x:0,z:0,yaw:0,pitch:0},createState(),0,{},true);assert.equal(view.visibleDistance,6);
});

test('arrow orbit reveals the face without turning fighter; mouse turns camera and fighter together',()=>{
 const scene=new T.Scene(),view=new Perspective(scene),camera=new T.PerspectiveCamera();
 const p={x:0,z:0,yaw:0,pitch:0};view.toggle(p.yaw);view.orbitYaw=0;
 updateCameraKeys(view,p,new Set(['ArrowLeft']),Math.PI/1.8);
 updateCameraKeys(view,p,new Set(['ArrowUp']),.2);
 assert.equal(p.yaw,0);assert.equal(p.pitch,0);
 view.update(camera,scene,p,createState(),0,{},true);
 assert.ok(camera.position.z<0,'camera reaches face side');assert.equal(view.body.root.rotation.y,0);
 const before=camera.position.clone(),angle=view.orbitYaw;
 mouseAim(p,.4,.2,view);view.update(camera,scene,p,createState(),0,{},true);
 assert.equal(p.yaw,-.4);assert.equal(p.pitch,-.2);assert.equal(view.orbitYaw,angle-.4);assert.ok(Math.abs((view.orbitYaw-p.yaw)-angle)<1e-8);assert.ok(camera.position.distanceTo(before)>.1);
 view.toggle();updateCameraKeys(view,p,new Set(['ArrowRight']),1);assert.ok(p.yaw<-.4);
});
