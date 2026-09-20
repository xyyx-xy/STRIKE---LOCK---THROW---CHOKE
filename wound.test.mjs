import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from './vendor/three.module.js';
import {FighterRig,pose} from './rig.js';
import {WoundJets,woundFrame} from './wound.js';
test('wound follows moving stump, expires and removes stale foot jet',()=>{
 const scene=new T.Scene(),rig=new FighterRig();scene.add(rig.root);rig.set(pose());
 const start=woundFrame(rig,'Larm').position.clone();rig.root.position.x=3;
 assert.ok(Math.abs(woundFrame(rig,'Larm').position.x-start.x-3)<1e-6);
 const jets=new WoundJets();jets.add(rig,'Lfoot');jets.add(rig,'Lleg');assert.equal(jets.items.length,1);assert.equal(jets.items[0].part,'Lleg');
 let count=0;for(let i=0;i<240;i++)jets.step(1/60,()=>count++);
 assert.ok(count>=83&&count<=84);assert.equal(jets.items.length,0);
 jets.add(rig,'Rarm');scene.remove(rig.root);jets.step(.1,()=>assert.fail());assert.equal(jets.items.length,0);
});
test('reset clears all jets and frame rate preserves emission count',()=>{
 const scene=new T.Scene(),rig=new FighterRig();scene.add(rig.root);rig.set(pose());
 const counts=[30,120].map(fps=>{const jets=new WoundJets();jets.add(rig,'Larm');let n=0;for(let i=0;i<fps*2;i++)jets.step(1/fps,()=>n++);jets.reset();assert.equal(jets.items.length,0);return n;});
 assert.ok(Math.abs(counts[0]-counts[1])<=1);
});
