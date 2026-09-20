import * as T from './vendor/three.module.js';

// Follow the remaining stump, including animated crawl and ragdoll poses.
export function woundFrame(rig, part) {
  const side = part[0], pose = rig.lastPose;
  const joint = part.endsWith('arm') ? side+'shoulder' : part.endsWith('leg') ? side+'hip' : side+'ankle';
  const next = part.endsWith('arm') ? side+'elbow' : part.endsWith('leg') ? side+'knee' : null;
  if (!pose?.[joint] || !rig.root.parent) return null;
  rig.root.updateMatrixWorld(true);
  const position = new T.Vector3(...pose[joint]).applyMatrix4(rig.root.matrixWorld);
  const direction = next ? new T.Vector3(...pose[next]).sub(new T.Vector3(...pose[joint])) : new T.Vector3(0,-1,-.2);
  direction.transformDirection(rig.root.matrixWorld);
  position.addScaledVector(direction,.045);
  return {position,direction};
}

export class WoundJets {
  constructor(){ this.items=[]; }
  add(rig,part){
    if(!rig) return;
    this.items=this.items.filter(w=>!(w.rig===rig&&(w.part===part||(part.endsWith('leg')&&w.part===part[0]+'foot'))));
    this.items.push({rig,part,age:0,carry:0});
    if(this.items.length>48)this.items.shift();
  }
  reset(){this.items=[];}
  step(dt,emit){
    this.items=this.items.filter(w=>{
      const active=Math.min(dt,Math.max(0,3.5-w.age));
      w.age+=dt;
      const frame=woundFrame(w.rig,w.part);
      if(!frame)return false;
      w.carry+=active*24;
      while(w.carry>=1){w.carry--;emit(frame.position,frame.direction,Math.max(.25,1-w.age/4));}
      return w.age<3.5;
    });
  }
}
