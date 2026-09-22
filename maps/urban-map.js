import * as T from '../vendor/three.module.js';
import {createIntersection,createRoadReflections} from './urban/intersection.js';
import {createBuildings} from './urban/buildings.js';
import {createStreetProps} from './urban/street-props.js';
import {createLighting} from './urban/lighting.js';
import {createAtmosphere} from './urban/atmosphere.js';
import {createSky} from './urban/sky.js';
import {Signage} from './urban/signage.js';
import {CollisionWorld} from './urban/collision.js';
import {batchStatic,resetRandom} from './urban/geometry.js';
import {prepareMaterials} from './urban/materials.js';

// The existing fighter simulation is planar. Curbs and raised sidewalks stay outside combat.
export function crossingBounds(){
  const half=11.4;
  return {bounds:{x:half,z:half},resolve(p,r=.32){
    p.x=T.MathUtils.clamp(p.x,-half+r,half-r);
    p.z=T.MathUtils.clamp(p.z,-half+r,half-r);
  },clear:()=>true,steer:(_,target)=>target};
}
export function createUrbanMap(root){
  resetRandom();prepareMaterials();
  root.background=new T.Color('#263b60');root.fog=new T.FogExp2('#293f63',.008);
  const world=new CollisionWorld(),signs=new Signage();
  createLighting(root);createIntersection(root,world);createBuildings(root,world,signs);
  const streets=createStreetProps(root,world,signs);
  batchStatic(root);createSky(root);createRoadReflections(root);
  const atmosphere=createAtmosphere(root);
  return {...crossingBounds(),update(seconds){signs.update(seconds);streets.update(seconds);atmosphere(seconds);},
    dispose(){
      // Alternate billboard images live in shader closures, outside manager's material scan.
      for(const texture of signs.textures)texture.dispose();
      signs.textures.length=0;signs.screens.length=0;signs.labels.clear();
    }
  };
}
