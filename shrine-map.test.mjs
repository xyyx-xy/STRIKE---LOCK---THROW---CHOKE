import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from './vendor/three.module.js';
import {mountMap} from './maps/manager.js';
import {animated} from './maps/shrine/components.js';
import {createState,tick} from './combat.js';
test('shrine scenery remounts with batches, instancing, bounded arena and no animation leaks',()=>{
 const scene=new T.Scene();let expected;
 for(let i=0;i<3;i++){
  const arena=mountMap(scene,'shrine');let batches=0,instances=0;
  scene.traverse(o=>{if(o.name==='static-batch')batches++;if(o.isInstancedMesh)instances++;});
  assert.ok(batches>0&&instances>0);expected??=animated.length;assert.equal(animated.length,expected);
  const p={x:100,z:100};arena.resolve(p);assert.ok(Math.hypot(p.x,p.z)<8.3);
  const s=createState();s.waveDelay=0;tick(s,{...arena.entry.spawn},1/60,arena);
  assert.equal(s.enemies.length,3);for(const e of s.enemies)assert.ok(Math.hypot(e.x,e.z)<8);
  arena.update(1);arena.update(2);arena.dispose();assert.equal(scene.children.length,0);assert.equal(animated.length,0);
 }
});
