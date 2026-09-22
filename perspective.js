import * as T from './vendor/three.module.js';
import {FighterRig,pose} from './rig.js';
import {guardPose,guardHands} from './guard.js';
import {showFists} from './punch.js';
import {lockHands} from './arm-lock.js';
import {readyFists} from './bindings.js';

export function orbitOffset(yaw,elevation,distance){
  const flat=Math.cos(elevation)*distance;
  return new T.Vector3(Math.sin(yaw)*flat,Math.sin(elevation)*distance,Math.cos(yaw)*flat);
}
export class Perspective {
  constructor(scene){
    this.active=false;this.elevation=.65;this.distance=6;this.orbitYaw=.55;
    this.body=new FighterRig(0x637f8b);this.body.root.visible=false;scene.add(this.body.root);
    this.ray=new T.Raycaster();this.target=new T.Vector3();this.lastKey='';this.visibleDistance=6;
  }
  toggle(yaw=0){this.active=!this.active;if(this.active&&!this.initialized){this.orbitYaw=yaw+.55;this.initialized=true;}this.lastKey='';return this.active;}
  tilt(delta){this.elevation=T.MathUtils.clamp(this.elevation+delta,.18,1.35);}
  zoom(delta){this.distance=T.MathUtils.clamp(this.distance*Math.exp(delta*.001),2.6,16);}
  update(camera,scene,p,s,time,bindings,started){
    this.body.root.visible=started&&this.active;
    if(!started||!this.active)return;
    const speed=Math.min(1,Math.hypot(p.vx||0,p.vz||0)/3.35);
    const n=Math.hypot(p.vx||0,p.vz||0)||1;
    const motion={forward:-((p.vx||0)*Math.sin(p.yaw)+(p.vz||0)*Math.cos(p.yaw))/n,
      right:((p.vx||0)*Math.cos(p.yaw)-(p.vz||0)*Math.sin(p.yaw))/n};
    const points=pose(time,speed,s.attack,motion);guardPose(points,s.guard,null,s.kneeSide);
    this.body.root.position.set(p.x,0,p.z);this.body.root.rotation.y=p.yaw;
    this.body.set(points);this.body.setHands(.8,.8);guardHands(this.body,s.guard);
    showFists(this.body,points,s.attack,s.guard,readyFists(bindings));lockHands(this.body,s.attack);
    this.target.set(p.x,1.1,p.z);
    const offset=orbitOffset(this.orbitYaw,this.elevation,this.distance),direction=offset.clone().normalize();
    const maps=scene.children.filter(o=>o.isScene);
    const key=[p.x,p.z,this.orbitYaw,this.elevation,this.distance,...maps.map(o=>o.id)].join(':');
    if(key!==this.lastKey){
      this.lastKey=key;this.ray.set(this.target,direction);this.ray.near=.12;this.ray.far=this.distance+.2;
      for(const root of maps)root.updateMatrixWorld(true);
      const hit=this.ray.intersectObjects(maps,true).find(h=>h.object.visible&&h.object.material?.depthWrite!==false);
      this.visibleDistance=hit?Math.max(.25,Math.min(this.distance,hit.distance-.2)):this.distance;
    }
    camera.position.copy(this.target).addScaledVector(direction,this.visibleDistance);
    camera.fov=55;camera.lookAt(this.target);camera.updateProjectionMatrix();
  }
}

// Observation keys never change the fighter's attack direction in third person.
export function updateCameraKeys(view,p,held,dt){
  const horizontal=(Number(held.has('ArrowLeft'))-Number(held.has('ArrowRight')))*dt*1.8;
  const vertical=(Number(held.has('ArrowUp'))-Number(held.has('ArrowDown')))*dt;
  if(view.active){view.orbitYaw+=horizontal;view.tilt(-vertical);}
  else {p.yaw+=horizontal;p.pitch=T.MathUtils.clamp(p.pitch+vertical,-1.35,1.35);}
}
export function mouseAim(p,dx,dy,view){
  p.yaw-=dx;p.pitch=T.MathUtils.clamp(p.pitch-dy,-1.35,1.35);
  if(view?.active){view.orbitYaw-=dx;view.tilt(dy);}
}
