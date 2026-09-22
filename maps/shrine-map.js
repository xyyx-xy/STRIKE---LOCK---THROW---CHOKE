import * as T from '../vendor/three.module.js';
import {createArena} from './shrine/arena.js';
import {createShrine} from './shrine/shrine.js';
import {createTorii} from './shrine/torii.js';
import {createEnvironment} from './shrine/environment.js';
import {createVegetation} from './shrine/vegetation.js';
import {createLighting} from './shrine/lighting.js';
import {createParticles} from './shrine/particles.js';
import {CollisionWorld} from './shrine/collision.js';
import {animated,batchStatic,resetSceneState} from './shrine/components.js';
import {wind,mat} from './shrine/materials.js';

// Original scenery; combat stays on the flat circular arena (stone rim is its boundary).
export function createShrineMap(root) {
  resetSceneState();wind.value=0;
  // Shared procedural assets can be uploaded again after a previous map disposal.
  for(const material of Object.values(mat)){material.needsUpdate=true;if(material.gradientMap)material.gradientMap.needsUpdate=true;}
  root.background=new T.Color('#b6c9bd');root.fog=new T.FogExp2('#b6c9bd',.016);
  const world=new CollisionWorld(),sun=createLighting(root);
  createArena(root);createShrine(root,world);createTorii(root,world);
  createEnvironment(root,world);createVegetation(root,world);batchStatic(root);
  const particles=createParticles(root),motion=[...animated];let previous=0;
  const radius=8.3;
  return {
    bounds:{x:radius,z:radius},
    resolve(entity,padding=.32){
      const length=Math.hypot(entity.x,entity.z),limit=radius-padding;
      if(length>limit){entity.x*=limit/length;entity.z*=limit/length;}
    },
    // Central arena is clear; all solid architecture is beyond its visible stone rim.
    clear:()=>true,steer:(_,player)=>player,
    update(seconds){
      const dt=Math.max(0,Math.min(.06,seconds-previous));previous=seconds;wind.value=seconds;
      for(const {g,amount,speed,phase}of motion)g.rotation.z=Math.sin(seconds*speed+phase)*amount;
      particles(seconds,dt);sun.intensity=2.6+Math.sin(seconds*.07)*.035;
    },
    dispose(){motion.length=0;animated.length=0;}
  };
}
