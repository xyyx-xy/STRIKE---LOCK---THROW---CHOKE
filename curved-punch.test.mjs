import test from 'node:test';
import assert from 'node:assert/strict';
import {ATTACKS,createState,beginAttack,tick,specialStrike} from './combat.js';
import {initBody} from './injury.js';
import {pose} from './rig.js';
const enemy=(guard=null)=>initBody({id:0,x:0,z:-1.2,hp:100,vx:0,vz:0,stun:0,wind:0,cool:99,phase:0,flash:0,guard});
const player=pitch=>({x:0,z:0,yaw:0,pitch});
test('hook bypasses high guard, uppercut does not; Sanchin intercepts both body attacks',()=>{
 assert.equal(specialStrike(player(.05),enemy('head'),ATTACKS.hook,'hook').part,'head');
 assert.match(specialStrike(player(.05),enemy('head'),ATTACKS.uppercut,'uppercut').part,/arm$/);
 for(const type of ['hook','uppercut'])assert.match(specialStrike(player(-.3),enemy('torso'),ATTACKS[type],type).part,/arm$/);
 const e=enemy('head');e.body.Larm.gone=e.body.Rarm.gone=true;
 assert.equal(specialStrike(player(.05),e,ATTACKS.uppercut,'uppercut').part,'head');
});
test('both punches respect short reach and cannot knock back; fatal roll counts death once',()=>{
 for(const type of ['hook','uppercut']){
  const e=enemy();e.z=-2;assert.equal(specialStrike(player(.05),e,ATTACKS[type],type),null);
  const s=createState();s.enemies=[enemy()];beginAttack(s,type);
  const ev=tick(s,player(.05),ATTACKS[type].active,null,()=>0);
  assert.equal(s.kills,1);assert.equal(s.enemies[0].body.head.hp,0);
  assert.equal(s.enemies[0].vx,0);assert.ok(s.enemies[0].vz===0);
  assert.equal(ev.filter(x=>x.type==='down').length,1);
  tick(s,player(.05),.1,null,()=>0);assert.equal(s.kills,1);
 }
});
test('uppercut torso slow expires and guarding prevents it and head fatal proc',()=>{
 const s=createState();s.enemies=[enemy()];beginAttack(s,'uppercut');tick(s,player(-.3),.24,null,()=>1);
 assert.equal(s.enemies[0].slow,3);assert.ok(s.enemies[0].vz===0);
 tick(s,player(-.3),3.1,null,()=>1);assert.equal(s.enemies[0].slow,0);
 for(const [guard,pitch]of [['torso',-.3],['head',.05]]){
  const a=createState();a.enemies=[enemy(guard)];beginAttack(a,'uppercut');tick(a,player(pitch),.24,null,()=>0);
  assert.ok(a.enemies[0].hp>0);assert.equal(a.enemies[0].slow,0);
 }
});
test('curved animations are distinct, mirrored and fully recover without moving feet',()=>{
 for(const type of ['hook','uppercut'])for(const side of [0,1]){
  const base=pose(),active=pose(0,0,{type,side,t:ATTACKS[type].active});
  assert.deepEqual(active.Lankle,base.Lankle);
  assert.deepEqual(pose(0,0,{type,side,t:ATTACKS[type].duration})[side?'Rwrist':'Lwrist'],base[side?'Rwrist':'Lwrist']);
  assert.ok(active[side?'Rwrist':'Lwrist'][2]<-.8);
 }
});
