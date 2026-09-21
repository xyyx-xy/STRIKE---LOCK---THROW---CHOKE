import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from './vendor/three.module.js';
import {QUALITY_PRESETS,loadQuality,applyQuality} from './quality.js';
import {loadMap,MAPS} from './maps/registry.js';
import {mountMap} from './maps/manager.js';
test('five quality levels apply real render settings and respect GPU caps',()=>{
 const scene=new T.Scene(),sun=new T.DirectionalLight();sun.castShadow=true;scene.add(sun);
 let disposed=0;const renderer={shadowMap:{enabled:true},capabilities:{maxTextureSize:2048,maxSamples:2},setPixelRatio(v){this.ratio=v;},setSize(w,h){this.size=[w,h];}};
 const composite={rt:{samples:4,dispose(){disposed++;}},resize(){}};
 for(const id of Object.keys(QUALITY_PRESETS)){const preset=applyQuality(id,renderer,composite,scene,800,600,2);assert.equal(renderer.ratio,preset.pixelRatio);assert.equal(renderer.shadowMap.enabled,preset.shadow>0);assert.ok(sun.shadow.mapSize.x<=2048);assert.ok(composite.rt.samples<=2);}
 assert.ok(disposed>0);assert.equal(loadQuality(undefined),'medium');assert.equal(loadQuality({getItem:()=> 'constructor'}),'medium');
});
test('map registry only contains tavern, stale meadow saves fall back, maps dispose cleanly',()=>{
 assert.deepEqual(Object.keys(MAPS),['tavern']);assert.equal(loadMap({getItem:()=> 'meadow'}),'tavern');
 const scene=new T.Scene();for(let i=0;i<3;i++){const arena=mountMap(scene,'tavern');assert.equal(scene.children.length,1);const p={x:100,z:100};arena.resolve(p);assert.ok(p.x<=arena.bounds.x);assert.ok(arena.entry.spawn);arena.dispose();assert.equal(scene.children.length,0);}
});
