import test from 'node:test';
import assert from 'node:assert/strict';
import {createState,tick} from './combat.js';
import {setupTraining,validateTraining,loadTraining} from './training.js';
import {MAPS} from './maps/registry.js';
import {mountMap} from './maps/manager.js';
import * as T from './vendor/three.module.js';
function practice(config={}){const s=createState();setupTraining(s,config);return {s,p:{x:0,z:4.4,yaw:0}};}
function run(s,p,seconds){for(let i=0;i<seconds*60;i++)tick(s,p,1/60,null,()=>.5);}
test('training count is bounded, stored config validated, zero enemies never creates waves',()=>{
 assert.equal(validateTraining({count:999}).count,10);assert.equal(loadTraining({getItem:()=>'{'}).count,1);
 const {s,p}=practice({count:0});run(s,p,8);assert.equal(s.enemies.length,0);assert.equal(s.wave,0);
});
test('stationary passive targets do not chase or attack; mobile targets pursue',()=>{
 for(const moving of [false,true]){const {s,p}=practice({count:1,moving});run(s,p,1);assert.equal(s.hp,100);assert.equal(s.enemies[0].atk,undefined);assert.equal(s.enemies[0].z>2,moving);}
});
test('fixed attack and defense work independently; player immortality is optional',()=>{
 for(const invincible of [false,true]){const {s,p}=practice({count:1,attacking:true,move:'punch',guard:'torso',invincible});p.z=3;run(s,p,4);assert.ok(s.enemies[0].attackCount>=2);assert.equal(s.hp===100,invincible);}
 const {s,p}=practice({count:1,guard:'head'});tick(s,p,1/60);assert.equal(s.enemies[0].guard,'head');
});
test('dead targets respawn after delay, without changing requested count or wave',()=>{
 for(const respawn of [false,true]){const {s,p}=practice({count:2,respawn});const old=s.enemies[0].id;s.enemies[0].hp=0;run(s,p,2);assert.equal(s.enemies.filter(e=>e.hp>0).length,1);run(s,p,2);assert.equal(s.enemies.filter(e=>e.hp>0).length,respawn?2:1);if(respawn)assert.ok(!s.enemies.some(e=>e.id===old));assert.equal(s.wave,0);}
});
test('training map mounts, confines entities and disposes cleanly',()=>{
 assert.equal(MAPS.training.mode,'training');const scene=new T.Scene(),map=mountMap(scene,'training');
 const p={x:100,z:-100};map.resolve(p);assert.ok(p.x<map.bounds.x&&p.z>-map.bounds.z);assert.ok(map.clear(p,{x:0,z:0}));map.dispose();assert.equal(scene.children.length,0);
});
