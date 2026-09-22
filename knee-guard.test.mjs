import test from 'node:test';
import assert from 'node:assert/strict';
import {guardBlocks,guardPose} from './guard.js';
import {canKneeGuard} from './knee-guard.js';
import {pose,FighterRig,enemyPose} from './rig.js';
import {initBody} from './injury.js';
import {createState,tick,ATTACKS,specialStrike} from './combat.js';
import {updateViewVisibility} from './viewmodel.js';
import {heldGuard,validateBindings} from './bindings.js';
import {newPlayback,stepPlayback} from './combos.js';

test('knee shield blocks only frontal kick/snap kicks on torso, legs and feet',()=>{
 const p={x:0,z:0,yaw:0};
 for(const move of ['kick','snapKick','palm','punch','hook','uppercut'])for(const zone of ['head','torso','leg','foot','Lleg','Rfoot']){
  const expected=['kick','snapKick'].includes(move)&&zone!=='head';
  assert.equal(guardBlocks('knee',zone,p,{x:0,z:-1},move),expected);
  assert.equal(guardBlocks('knee',zone,p,{x:0,z:1},move),false);
 }
});
test('player guard prevents damage and displacement but leaves head and punches exposed',()=>{
 for(const type of ['kick','snapKick','punch'])for(const zone of ['head','torso','leg','foot']){
  const s=createState(),p={x:0,z:0,yaw:0};s.guard='knee';
  s.enemies=[initBody({id:0,x:0,z:-1,hp:100,vx:0,vz:0,stun:0,cool:9,phase:0,flash:0,wind:1,atk:{type,side:0,t:ATTACKS[type].active,hit:false,zone}})];
  const blocked=type!=='punch'&&zone!=='head',events=tick(s,p,.01);
  assert.equal(s.hp===100,blocked);assert.equal(events[0].type,blocked?'block':'hurt');
  if(blocked)assert.equal(p.z,0);
 }
});
test('NPC knee defense cancels kick damage and effects on protected contacts, never head hits',()=>{
 const e=initBody({id:0,x:0,z:-1.5,hp:100,vx:0,vz:0,cool:9,stun:0,ko:0,guard:'knee',phase:0,flash:0});e.pose=enemyPose(e);
 let protectedHit=false,headHit=false;
 for(let pitch=-1.1;pitch<.25;pitch+=.02){
  const p={x:0,z:0,yaw:0,pitch},h=specialStrike(p,e,ATTACKS.snapKick,'snapKick');
  if(!h)continue;
  if(h.part==='head'){headHit=true;assert.ok(!h.blocked);}
  if(h.blocked){
   protectedHit=true;const s=createState();s.enemies=[structuredClone(e)];s.attack={type:'snapKick',side:0,t:.085,hit:false};
   const before=JSON.stringify(s.enemies[0].body),events=tick(s,p,.01,null,()=>0);
   assert.ok(events.some(v=>v.type==='guarded'));assert.equal(JSON.stringify(s.enemies[0].body),before);
   assert.ok(!events.some(v=>['hit','sever','kneeling','down'].includes(v.type)));
  }
 }
 assert.ok(protectedHit&&headHit);
 e.body.Lleg.gone=true;assert.equal(canKneeGuard(e.body),false);
});
test('lifted knee keeps bone lengths, appears in first person and supports bindings/combos',()=>{
 const base=pose(),q=guardPose(pose(),'knee'),rig=new FighterRig();
 assert.ok(q.Lknee[1]>1.15&&q.Lknee[1]<1.2);assert.deepEqual(q.Rankle,base.Rankle);
 for(const [a,b]of [['Lhip','Lknee'],['Lknee','Lankle']])assert.ok(Math.abs(Math.hypot(...q[a].map((x,i)=>x-q[b][i]))-.43)<1e-8);
 updateViewVisibility(rig,null,'knee');assert.ok(rig.ends.Lankle.visible);assert.ok(!rig.ends.Rankle.visible);
 updateViewVisibility(rig,null);assert.ok(!rig.ends.Lankle.visible);
 const bindings=validateBindings({KeyE:'guardKnee'});assert.equal(heldGuard(bindings,new Set(['KeyE'])),'knee');
 const play=newPlayback({name:'膝防',steps:[{move:'guardKnee',hold:.5}]});assert.equal(stepPlayback(play,.1,false,()=>true).guard,'knee');
});


test('knee defense preserves ready fists/palms while hand guards still open palms',async()=>{
 const {showFists}=await import('./punch.js');
 const rig=new FighterRig(),q=guardPose(pose(),'knee');
 for(const ready of [true,false]){
  showFists(rig,q,null,'knee',ready);
  for(const h of Object.values(rig.hands)){assert.equal(h.fist.visible,ready);assert.equal(h.palm.visible,!ready);}
  showFists(rig,q,null,'head',ready);assert.equal(rig.hands.L.fist.visible,false);
  showFists(rig,q,null,'torso',ready);assert.equal(rig.hands.R.fist.visible,false);
  showFists(rig,pose(),null,null,ready);assert.equal(rig.hands.L.fist.visible,ready);
 }
});


test('first-person guarding knee stays inside the camera frame',async()=>{
 const T=await import('./vendor/three.module.js');
 const {kneeGuardViewPose}=await import('./knee-guard.js');
 const q=kneeGuardViewPose(guardPose(pose(),'knee'),'knee');
 const camera=new T.PerspectiveCamera(76,16/9,.03,8);camera.updateMatrixWorld();
 const knee=new T.Vector3(...q.Lknee).add(new T.Vector3(0,-1.67,-.32)).project(camera);
 assert.ok(Math.abs(knee.x)<1&&Math.abs(knee.y)<1,'knee must not disappear below screen');
});

test('head and knee combine in either input order and release independently',()=>{
 const bindings=validateBindings({KeyQ:'guardHead',KeyE:'guardKnee'});
 for(const keys of [['KeyQ','KeyE'],['KeyE','KeyQ']])assert.equal(heldGuard(bindings,new Set(keys)),'headKnee');
 assert.equal(heldGuard(bindings,new Set(['KeyQ'])),'head');
 assert.equal(heldGuard(bindings,new Set(['KeyE'])),'knee');
});
test('combined defense blocks head and lower body punches/kicks, torso only kicks',()=>{
 for(const type of ['palm','punch','hook','uppercut','kick','snapKick'])for(const zone of ['head','torso','leg','foot']){
  const s=createState(),p={x:0,z:0,yaw:0};s.guard='headKnee';
  s.enemies=[initBody({id:0,x:0,z:-1,hp:100,vx:0,vz:0,stun:0,cool:9,phase:0,flash:0,wind:1,atk:{type,side:0,t:ATTACKS[type].active,hit:false,zone}})];
  const blocked=zone!=='torso'||['kick','snapKick'].includes(type),events=tick(s,p,.01);
  assert.equal(s.hp===100,blocked);assert.equal(events[0].type,blocked?'block':'hurt');
  assert.equal(guardBlocks('headKnee',zone,p,{x:0,z:1},type),false);
 }
});
test('knee alternates per activation, not per frame or when adding head guard',async()=>{
 const {updateKneeSide}=await import('./knee-guard.js');const s={guard:'knee'};
 updateKneeSide(s);assert.equal(s.kneeSide,0);
 for(let i=0;i<60;i++)updateKneeSide(s);assert.equal(s.kneeSide,0);
 s.guard='headKnee';updateKneeSide(s);assert.equal(s.kneeSide,0);
 s.guard='head';updateKneeSide(s);s.guard='headKnee';updateKneeSide(s);assert.equal(s.kneeSide,1);
 s.guard=null;updateKneeSide(s);s.guard='knee';updateKneeSide(s);assert.equal(s.kneeSide,0);
});
test('combined pose raises matching leg and keeps closed forearms, both legs visible in turn',()=>{
 for(const side of [0,1]){
  const q=guardPose(pose(),'headKnee',null,side),leg=side?'R':'L',other=side?'L':'R',rig=new FighterRig();
  assert.ok(q[leg+'knee'][1]>1.15);assert.ok(q[other+'ankle'][1]<.2);
  assert.equal(q.Lwrist[0],q.Lelbow[0]);assert.ok(q.Lwrist[1]>1.7);
  updateViewVisibility(rig,null,'headKnee',side);assert.ok(rig.ends[leg+'ankle'].visible);assert.ok(!rig.ends[other+'ankle'].visible);
 }
});
