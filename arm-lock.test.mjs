import test from 'node:test';
import assert from 'node:assert/strict';
import {extendedArm,ARM_LOCK} from './arm-lock.js';
import {pose,enemyPose} from './rig.js';
import {initBody} from './injury.js';
import {beginAttack,createState,tick,strikeHit} from './combat.js';
const enemy=()=>initBody({id:0,hp:100,x:0,z:-1.2,wind:.31,attackSide:0,stun:0,ko:0,phase:0,cool:99,vx:0,vz:0,flash:0});
function fixture(){const e=enemy();e.pose=pose(0,0,{type:'palm',side:0,t:.17});const p={x:0,z:0,yaw:0,pitch:0};for(let pitch=-.8;pitch<.2;pitch+=.04)for(let yaw=-.6;yaw<.6;yaw+=.015){p.yaw=yaw;p.pitch=pitch;const h=strikeHit(p,e,ARM_LOCK);if(h?.part==='Larm')return {e,p};}throw Error('no arm ray');}
test('only the extended attacking arm is eligible',()=>{
 const e=enemy(),q=pose(0,0,{type:'palm',side:0,t:.17});assert.ok(extendedArm(e,'Larm',q));assert.equal(extendedArm(e,'Rarm',q),false);assert.equal(extendedArm(e,'head',q),false);e.wind=0;assert.equal(extendedArm(e,'Larm',q),false);
});
test('success begins modeled lock then severs once without killing; failure changes nothing',()=>{
 for(const roll of [.49,.5]){const {e,p}=fixture(),s=createState();s.enemies=[e];const before=structuredClone(e);
 const ok=beginAttack(s,'armLock',{p,rng:()=>roll});assert.equal(ok,roll<.5);
 if(!ok){assert.equal(s.attack,null);assert.deepEqual(e,before);continue;}
 assert.ok(e.armLock);assert.equal(e.body.Larm.gone,false);tick(s,p,.2,null,()=>1);assert.ok(enemyPose(e).Lwrist);const events=tick(s,p,.33,null,()=>1);assert.equal(events.filter(x=>x.type==='sever').length,1);assert.equal(e.body.Larm.gone,true);assert.equal(e.hp,100);assert.equal(s.kills,0);tick(s,p,.4);assert.ok(e.blood<100);assert.equal(s.attack,null);
 }
});
test('misses, nonattacking arms and furniture never trigger a lock',()=>{
 const {e,p}=fixture(),s=createState();s.enemies=[e];assert.equal(beginAttack(s,'armLock',{p,arena:{clear:()=>false},rng:()=>0}),false);
 assert.equal(beginAttack(s,'armLock',{p:{...p,pitch:1.2},rng:()=>0}),false);e.wind=0;assert.equal(beginAttack(s,'armLock',{p,rng:()=>0}),false);
});

test('empty forward reach plays a full harmless lock animation without late target capture',()=>{
 const s=createState(),p={x:0,z:0,yaw:0,pitch:0};s.waveDelay=99;
 assert.ok(beginAttack(s,'armLock',{p,rng:()=>{throw Error('preview must not roll');}}));
 assert.equal(s.attack.preview,true);assert.equal(beginAttack(s,'armLock',{p}),false);
 const e=enemy();s.enemies=[e];const before=e.body.Larm.hp;
 const events=tick(s,p,.53,null,()=>1);assert.ok(s.attack);assert.equal(e.body.Larm.hp,before);assert.ok(!events.some(e=>['sever','locked'].includes(e.type)));
 tick(s,p,.33,null,()=>1);assert.equal(s.attack,null);
});

test('reference animation separates hand roles, mirrors and returns to rest',()=>{
 const base=pose(),contact=pose(0,0,{type:'armLock',side:0,t:.12}),fold=pose(0,0,{type:'armLock',side:0,t:.46});
 assert.ok(contact.Rwrist[2]<contact.Lwrist[2]-.25);
 assert.ok(fold.Rwrist[1]-fold.Lwrist[1]>.45);
 for(const t of [0,.12,.28,.46,.52,.64,.85]){
  const a=pose(0,0,{type:'armLock',side:0,t}),b=pose(0,0,{type:'armLock',side:1,t});
  for(const part of ['wrist','elbow']){assert.ok(Math.abs(a['R'+part][0]+b['L'+part][0])<1e-9);assert.equal(a['R'+part][1],b['L'+part][1]);}
 }
 assert.deepEqual(pose(0,0,{type:'armLock',side:0,t:.85}),base);
 const {e,p}=fixture(),s=createState();s.enemies=[e];beginAttack(s,'armLock',{p,rng:()=>0});const initial=enemyPose(e);
 e.armLock.t=.46;const folded=enemyPose(e);
 for(const [a,b]of [['Lshoulder','Lelbow'],['Lelbow','Lwrist']]){const length=q=>Math.hypot(...q[a].map((x,i)=>x-q[b][i]));assert.ok(Math.abs(length(initial)-length(folded))<1e-9);}
 assert.ok(folded.Lwrist[1]>folded.Lelbow[1]);
});
