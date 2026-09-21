import {damagePart,isGone} from './injury.js';
export const ARM_LOCK={duration:.85,active:.52,range:1.8,damage:0,push:0,cone:.8,r:.018};
export function extendedArm(e,part,q){
  if(!part?.endsWith('arm')||isGone(e,part)||e.hp<=0||!(e.wind>0)||e.stun>0||e.ko>0||e.kneel>0)return false;
  const side=part[0];if(side!==(e.attackSide?'R':'L'))return false;
  const a=q[side+'shoulder'],b=q[side+'elbow'],c=q[side+'wrist'];
  const u=b.map((v,i)=>v-a[i]),v=c.map((x,i)=>x-b[i]);
  return u.reduce((n,x,i)=>n+x*v[i],0)/(Math.hypot(...u)*Math.hypot(...v))>.88;
}
export function startArmLock(s,e,hit,q){
  if(!extendedArm(e,hit.part,q))return false;
  s.attack={type:'armLock',side:hit.part[0]==='R'?1:0,t:0,hit:false,target:e,part:hit.part,pos:hit.pos};
  e.armLock={pose:structuredClone(q),side:hit.part[0],t:0};e.wind=0;e.guard=null;e.stun=ARM_LOCK.duration;e.vx=e.vz=0;
  return true;
}
export function tickArmLock(s,dt,events){
  const a=s.attack,e=a.target;a.t+=dt;
  if(a.preview){if(a.t>=ARM_LOCK.duration)s.attack=null;return;}
  if(e.hp<=0||(!a.hit&&isGone(e,a.part))){delete e.armLock;s.attack=null;return;}
  if(e.armLock)e.armLock.t=a.t;
  if(!a.hit&&a.t>=ARM_LOCK.active){
    a.hit=true;damagePart(e,a.part,1000,()=>1);
    events.push({type:'sever',enemy:e,part:a.part,pos:a.pos});
    events.push({type:'locked',enemy:e});
    delete e.armLock;
  }
  if(a.t>=ARM_LOCK.duration)s.attack=null;
}
const mix=(a,b,t)=>a.map((x,i)=>x+(b[i]-x)*t);
const smooth=t=>{const v=Math.max(0,Math.min(1,t));return v*v*(3-2*v);};
// Right hand leads the reference silhouette; mirror when catching the other arm.
export const LOCK_FRAMES=[
  {t:0},
  {t:.12,Rwrist:[.13,1.22,-.78],Relbow:[.31,1.13,-.39],Lwrist:[-.29,1.22,-.43],Lelbow:[-.36,1.08,-.22]},
  {t:.28,Rwrist:[.17,1.55,-.84],Relbow:[.35,1.25,-.43],Lwrist:[-.08,1.38,-.64],Lelbow:[-.33,1.18,-.31]},
  {t:.46,Rwrist:[.12,1.70,-.75],Relbow:[.33,1.34,-.40],Lwrist:[-.10,1.20,-.54],Lelbow:[-.35,1.08,-.24]},
  {t:.52,Rwrist:[.08,1.68,-.70],Relbow:[.30,1.32,-.38],Lwrist:[-.12,1.16,-.50],Lelbow:[-.37,1.06,-.22]},
  {t:.64,Rwrist:[.20,1.49,-.58],Relbow:[.35,1.20,-.27],Lwrist:[-.24,1.25,-.40],Lelbow:[-.37,1.09,-.18]},
  {t:ARM_LOCK.duration}
];
export function armLockPose(p,a){
  const t=Math.max(0,Math.min(ARM_LOCK.duration,a.t));let i=1;
  while(i<LOCK_FRAMES.length-1&&t>LOCK_FRAMES[i].t)i++;
  const first=LOCK_FRAMES[i-1],last=LOCK_FRAMES[i],weight=smooth((t-first.t)/(last.t-first.t));
  for(const key of ['Lwrist','Lelbow','Rwrist','Relbow']){
    const source=a.side?(key[0]==='L'?'R':'L')+key.slice(1):key;
    const point=frame=>frame[source]?[frame[source][0]*(a.side?-1:1),...frame[source].slice(1)]:p[key];
    p[key]=mix(point(first),point(last),weight);
  }
  return p;
}
const unit=v=>{const length=Math.hypot(...v)||1;return v.map(x=>x/length);};
const offset=(a,v,length)=>a.map((x,i)=>x+v[i]*length);
export function lockedEnemyPose(e){
  const lock=e.armLock,p=structuredClone(lock.pose),side=lock.side,k=side==='L'?-1:1;
  const shoulder=p[side+'shoulder'],elbow=p[side+'elbow'],wrist=p[side+'wrist'];
  const upper=elbow.map((x,i)=>x-shoulder[i]),lower=wrist.map((x,i)=>x-elbow[i]);
  const fold=smooth((lock.t-.12)/.34),finish=smooth((lock.t-.40)/.12);
  const upperDir=unit(mix(unit(upper),unit([k*.28,-.12,-.65]),fold));
  const lowerDir=unit(mix(unit(lower),unit([-k*.16,.75,.20]),fold));
  p[side+'elbow']=offset(shoulder,upperDir,Math.hypot(...upper));
  p[side+'wrist']=offset(p[side+'elbow'],lowerDir,Math.hypot(...lower));
  p.head[0]+=k*.09*finish;p.head[1]-=.09*finish;
  return p;
}
export function lockHands(rig,a){
  // Restore temporary thumb mirroring even on the first frame after the lock.
  for(const [side,h] of Object.entries(rig.hands)){
    h.thumb.position.x=side==='L'?.075:-.075;
  }
  if(a?.type!=='armLock')return;
  const grip=smooth(a.t/.12)*(1-smooth((a.t-.56)/.29));
  const lead=a.side?'L':'R',mirror=a.side?-1:1;
  for(const [side,h] of Object.entries(rig.hands)){
    const front=side===lead;
    // Native palm faces -Y: a half turn presents the lead palm upward.
    // Positive screen-plane rotation is counterclockwise for the right lead.
    const target=h.group.quaternion.clone();
    const saved=h.group.quaternion.clone();
    h.group.rotation.set(0,0,front?mirror*Math.PI:0);
    target.copy(h.group.quaternion);
    h.group.quaternion.copy(saved).slerp(target,grip);
    for(const [f,f2] of h.fingers){
      f.rotation.x=.12+(-.95-.12)*grip;
      f2.rotation.x=.08+(-1.12-.08)*grip;
    }
    if(front){
      // Keep the thumb on the left of the upturned right palm (mirror for left).
      h.thumb.position.x=(side==='L'?.075:-.075)*(1-2*grip);
    }
    h.thumb.rotation.x+=(-.85-h.thumb.rotation.x)*grip;
    // Twist the forearm mesh around its long axis, preserving elbow/wrist joints.
    const bone=rig.parts.find(part=>part.link[0]===side+'elbow');
    if(front&&bone)bone.mesh.rotateY(-mirror*Math.PI*grip);
  }
}
