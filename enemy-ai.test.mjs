import test from 'node:test';
import assert from 'node:assert/strict';
import {ATTACKS, MOVE_POOL, createState, tick} from './combat.js';
import {initBody} from './injury.js';

function fixture(type, distance = 1) {
  const s = createState();
  const p = {x:0, z:0, yaw:0};
  const e = initBody({id:0, x:0, z:-distance, hp:100, vx:0, vz:0,
    cool:0, wind:ATTACKS[type].duration, stun:0, phase:0, flash:0,
    moves:[type], atk:{type, side:0, t:0, hit:false, zone:'head'}});
  s.enemies = [e];
  return {s, p, e};
}
function advance(s, p, seconds) {
  const events = [];
  for (let i=0; i<Math.ceil(seconds*60); i++) events.push(...tick(s,p,1/60,null,()=>.5));
  return events;
}

for (const type of MOVE_POOL) {
  for (const outcome of ['hit', 'block', 'miss']) {
    test(`${type}: ${outcome} resolves once, recovers and resumes pursuit`, () => {
      const {s,p,e} = fixture(type, outcome==='miss'?4:1);
      if (outcome==='block') s.guard='head';
      const events = advance(s,p,ATTACKS[type].duration+.02);
      assert.equal(e.atk,null,'attack must end independently of first contact');
      assert.equal(e.wind,0);
      assert.ok(e.cool>0,'recovery starts cooldown');
      const contacts=events.filter(v=>v.type==='hurt'||v.type==='block');
      assert.equal(contacts.length,outcome==='miss'?0:1);
      if (contacts.length) assert.equal(contacts[0].type,outcome==='hit'?'hurt':'block');
      assert.equal(s.hp,outcome==='hit'?100-Math.round(ATTACKS[type].damage*.38):100);
      p.z=5;
      const before=e.z;
      advance(s,p,.2);
      assert.ok(e.z>before,'enemy must follow a retreating player after recovery');
    });
  }
  test(`${type}: repeated attacks continue after cooldown`, () => {
    const {s,p,e}=fixture(type);
    const events=advance(s,p,6);
    assert.ok(events.filter(v=>v.type==='hurt').length>=2);
    assert.ok(e.attackCount>=2);
    assert.ok(!s.ended);
  });
}

test('ten varied enemies keep attacking across a sustained simulation', () => {
  const s=createState(),p={x:0,z:0,yaw:0};
  s.hp=10000;
  s.enemies=Array.from({length:10},(_,id)=>{
    const {e}=fixture(MOVE_POOL[id%MOVE_POOL.length]);
    const angle=id/10*Math.PI*2;
    Object.assign(e,{id,x:Math.sin(angle)*2,z:Math.cos(angle)*2,atk:null,wind:0});
    return e;
  });
  advance(s,p,20);
  for(const e of s.enemies) {
    assert.ok(e.attackCount>=2,`enemy ${e.id} must keep selecting attacks`);
    assert.ok(!e.atk||e.atk.t<ATTACKS[e.atk.type].duration);
    assert.ok(Number.isFinite(e.x)&&Number.isFinite(e.z));
  }
});
