import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from './vendor/three.module.js';
import {FighterRig,pose} from './rig.js';
import {showFists} from './punch.js';
import {createState,beginAttack,tick,ATTACKS} from './combat.js';
import {initBody} from './injury.js';
import {CONTROLS,DEFAULT_BINDINGS,loadBindings,validateBindings,pressBinding,heldGuard,defenseHint} from './bindings.js';
import {MOVES,newPlayback,stepPlayback} from './combos.js';

test('solid fist striking face leads the thumb; guard restores original palms',()=>{
  const rig=new FighterRig(),a={type:'punch',side:0,t:.14},p=pose(0,0,a);
  rig.set(p);showFists(rig,p,a,null);
  for(const side of ['L','R']){
    const h=rig.hands[side];assert.ok(h.fist.visible);assert.equal(h.palm.visible,false);
    const front=[h.fist.getObjectByName('knuckle-face')];
    assert.ok(front[0]);
    const thumb=h.fist.getObjectByName('outside-thumb');
    assert.ok(front.every(m=>m.position.z-m.scale.z/2 < thumb.position.z-thumb.scale.z/2));
    const axis=new T.Vector3(0,0,-1).applyQuaternion(h.group.quaternion);
    const dir=new T.Vector3(...p[side+'wrist']).sub(new T.Vector3(...p[side+'elbow'])).normalize();
    assert.ok(axis.dot(dir)>.999);
  }
  showFists(rig,p,null,'head',true);
  assert.equal(rig.hands.L.fist.visible,false);assert.ok(rig.hands.L.palm.visible);
});
test('both straight punches peak on the hit frame and return without kicking',()=>{
  for(const side of [0,1]){
    const name=side?'R':'L',base=pose(),active=pose(0,0,{type:'punch',side,t:ATTACKS.punch.active});
    assert.ok(active[name+'wrist'][2]<base[name+'wrist'][2]-.6);
    assert.deepEqual(active.Lankle,base.Lankle);assert.deepEqual(active.Rankle,base.Rankle);
    assert.deepEqual(pose(0,0,{type:'punch',side,t:.42})[name+'wrist'],base[name+'wrist']);
  }
});
test('straight punch deals one localized hit and respects full recovery',()=>{
  const s=createState(),p={x:0,z:0,yaw:0,pitch:-.25};
  s.enemies=[initBody({id:0,x:0,z:-1.6,hp:100,vx:0,vz:0,wind:0,stun:0,cool:99,phase:0,flash:0})];
  assert.ok(beginAttack(s,'punch'));
  const events=tick(s,p,.14,null,()=>1);
  assert.equal(events.filter(e=>e.type==='hit').length,1);
  assert.equal(events.find(e=>e.type==='hit').attack,'punch');
  assert.equal(beginAttack(s,'punch'),false);
  assert.equal(tick(s,p,.10,null,()=>1).filter(e=>e.type==='hit').length,0);
  tick(s,p,.20,null,()=>1);assert.equal(s.attack,null);
});
test('all four inputs can use every single move, fixed side or held defense',()=>{
  for(const key of Object.keys(CONTROLS))for(const [id,move] of Object.entries(MOVES)){
    const bindings={...DEFAULT_BINDINGS,[key]:id},held=new Set([key]),s=createState();
    const result=pressBinding(s,bindings,key,held);
    if(move.guard){assert.equal(result,false);assert.equal(heldGuard(bindings,held),move.guard);held.clear();assert.equal(heldGuard(bindings,held),null);}
    else{assert.ok(result);assert.equal(s.attack.type,move.type);assert.equal(s.attack.side,move.side);}
  }
});
test('rebound defense overrides and release restores another held defense; stale combo guard clears on attack',()=>{
  const bindings={...DEFAULT_BINDINGS,Mouse0:'guardHead',KeyQ:'punchR'};
  const held=new Set(['Mouse0','KeyE']);assert.equal(heldGuard(bindings,held),'torso');
  held.delete('KeyE');assert.equal(heldGuard(bindings,held),'head');
  const s=createState();assert.equal(pressBinding(s,bindings,'KeyQ',held),false);
  held.clear();s.guard='head';assert.ok(pressBinding(s,bindings,'KeyQ',held));assert.equal(s.attack.side,1);
  assert.equal(defenseHint(bindings,'head'),'鼠标左键');
});
test('bindings persist, corrupt values fall back, punch combos preserve side',()=>{
  const b={...DEFAULT_BINDINGS,Mouse0:'punchL',Mouse2:'punchR'};
  assert.deepEqual(loadBindings({getItem:()=>JSON.stringify(b)}),b);
  assert.deepEqual(loadBindings(undefined),DEFAULT_BINDINGS);
  assert.equal(validateBindings({KeyQ:'constructor'}).KeyQ,'guardHead');
  const play=newPlayback({name:'双拳',steps:[{move:'punchL'},{move:'punchR'}]}),calls=[];
  const start=(...a)=>{calls.push(a);return true;};
  stepPlayback(play,.1,false,start);stepPlayback(play,.1,true,start);stepPlayback(play,.1,false,start);
  assert.deepEqual(calls,[['punch',0],['punch',1]]);
});
