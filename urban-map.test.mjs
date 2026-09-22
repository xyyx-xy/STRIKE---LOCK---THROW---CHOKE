import test from 'node:test';
import assert from 'node:assert/strict';
import {crossingBounds} from './maps/urban-map.js';
import {createState,tick} from './combat.js';
import {MAPS} from './maps/registry.js';
test('urban combat stays on flat road, with clear spawn circle and registered camera settings',()=>{
 const arena=crossingBounds();
 for(let angle=0;angle<Math.PI*2;angle+=.1){const p={x:100*Math.cos(angle),z:100*Math.sin(angle)};arena.resolve(p,.4);assert.ok(Math.abs(p.x)<=11&&Math.abs(p.z)<=11);}
 const s=createState();s.waveDelay=0;tick(s,{...MAPS.urban.spawn},1/60,arena);
 assert.equal(s.enemies.length,3);
 for(const e of s.enemies){assert.ok(Math.abs(e.x)<11&&Math.abs(e.z)<11);assert.ok(arena.clear(e,MAPS.urban.spawn));}
 assert.equal(MAPS.urban.far,210);assert.equal(MAPS.urban.exposure,1.16);
});
