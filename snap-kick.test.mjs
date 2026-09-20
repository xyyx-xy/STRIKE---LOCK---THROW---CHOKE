import test from 'node:test';
import assert from 'node:assert/strict';
import {SNAP_KICK,snapImpact} from './snap-kick.js';
import {initBody,damagePart,mobility} from './injury.js';
import {createState,beginAttack,tick,strikeHit,ATTACKS} from './combat.js';
import {pose,enemyPose,FighterRig} from './rig.js';
import {updateViewVisibility} from './viewmodel.js';
const enemy=()=>initBody({id:1,x:0,z:-1.5,hp:100,vx:0,vz:0,wind:0,cool:0,stun:0,phase:0,flash:0});
test('snap kick only breaks shins on a successful chance, preserving life and bleeding',()=>{
  for(const [region,roll,broken]of [['shin',0,true],['shin',1,false],[undefined,0,false]]){
    const e=enemy(),h={part:'Lleg',region},r=damagePart(e,h.part,22,()=>1);
    snapImpact(e,h,r,()=>roll);assert.equal(e.body.Lleg.gone,broken);assert.equal(e.hp,100);
    if(broken){assert.ok(e.body.Lfoot.gone);const s=createState();s.enemies=[e];tick(s,{x:0,z:0,yaw:0},.1);assert.ok(e.blood<100);}
  }
});
test('head and torso kneel for three seconds, arms cannot proc; dead opponents stay dead',()=>{
  for(const part of ['head','torso','Larm']){
    const e=enemy(),r=damagePart(e,part,22,()=>1);
    assert.equal(snapImpact(e,{part},r,()=>0),part!=='Larm');
    if(part==='Larm')continue;
    const s=createState();s.enemies=[e];const p={x:0,z:0,yaw:0};
    tick(s,p,1);assert.equal(e.kneel,2);assert.equal(e.wind,0);assert.equal(e.guard,null);assert.equal(e.z,-1.5);assert.equal(mobility(e).mode,'kneel');
    const q=enemyPose(e);assert.ok(q.Lknee[1]<.15);assert.ok(q.Rknee[1]>.4);assert.ok(q.head[1]<1.4);
    tick(s,p,2);assert.equal(e.kneel,0);assert.equal(mobility(e).mode,'walk');
  }
  const e=enemy();e.hp=0;assert.equal(snapImpact(e,{part:'head'},{},()=>0),false);
});
test('snap collision labels shin volumes and combat emits sever and kneeling events',()=>{
  const p={x:.18,z:0,yaw:0,pitch:0};
  for(const target of ['shin','torso']){
    const s=createState(),e=enemy();e.cool=99;s.enemies=[e];
    let hit;
    for(let pitch=-1.2;pitch<.2;pitch+=.01){p.pitch=pitch;hit=strikeHit(p,e,SNAP_KICK);if(target==='shin'?hit?.region==='shin':hit?.part==='torso')break;}
    assert.ok(target==='shin'?hit?.region==='shin':hit?.part==='torso');
    beginAttack(s,'snapKick');const events=tick(s,p,SNAP_KICK.active,null,()=>0);
    assert.ok(events.some(x=>x.type===(target==='shin'?'sever':'kneeling')));
  }
});
test('both snap legs extend quickly, recover and appear in first person',()=>{
  assert.ok(SNAP_KICK.duration<ATTACKS.palm.duration);
  for(const side of [0,1]){
    const s=side?'R':'L',base=pose(),a={type:'snapKick',side,t:SNAP_KICK.active},p=pose(0,0,a);
    assert.ok(p[s+'ankle'][2]<-.8);assert.deepEqual(pose(0,0,{...a,t:.26}),base);
    const rig=new FighterRig();updateViewVisibility(rig,a);assert.ok(rig.ends[s+'ankle'].visible);assert.equal(rig.ends[(side?'L':'R')+'ankle'].visible,false);
  }
});
