import {damagePart,isGone} from './injury.js';

export const SNAP_KICK = {duration:.26,active:.085,range:2.15,damage:12,push:0,cone:.68,r:.085,breakChance:.20,kneelChance:.30,kneelDuration:3};

// Extra effects only apply to the body volume actually struck, after normal damage.
export function snapImpact(e,hit,result,rng=Math.random) {
  if(e.hp<=0)return false;
  if(hit.region==='shin'&&!result.severed&&rng()<SNAP_KICK.breakChance){
    const broken=damagePart(e,hit.part,1000,()=>1);
    result.severed=broken.severed;
  }
  if(['head','torso'].includes(hit.part)&&rng()<SNAP_KICK.kneelChance){
    e.kneel=SNAP_KICK.kneelDuration;e.ko=0;e.wind=0;e.guard=null;
    e.vx=0;e.vz=0;result.stunned=false;
    return true;
  }
  return false;
}

const blend=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
export function snapKickPose(p,a) {
  const side=a.side?'R':'L',sign=a.side?1:-1,t=a.t;
  const frames=[{t:0,k:p[side+'knee'],f:p[side+'ankle']},
    {t:.045,k:[sign*.18,1.10,-.39],f:[sign*.18,.70,-.18]},
    {t:.085,k:[sign*.18,1.06,-.42],f:[sign*.18,1.08,-.86]},
    {t:.15,k:[sign*.18,1.10,-.39],f:[sign*.18,.70,-.18]},
    {t:.26,k:p[side+'knee'],f:p[side+'ankle']}];
  let i=1;while(i<frames.length-1&&t>frames[i].t)i++;
  const l=frames[i-1],r=frames[i],u=Math.max(0,Math.min(1,(t-l.t)/(r.t-l.t))),q=u*u*(3-2*u);
  p[side+'knee']=blend(l.k,r.k,q);p[side+'ankle']=blend(l.f,r.f,q);
  return p;
}

export function kneelPose(p,e) {
  if(!(e.kneel>0)||e.ko>0||isGone(e,'Lleg')||isGone(e,'Rleg'))return p;
  const u=Math.min(1,(3-e.kneel)/.16,e.kneel/.24),q=Math.max(0,u);
  const target={hip:[0,.54,.08],chest:[0,.89,-.14],neck:[0,1.06,-.23],head:[0,1.25,-.28],
    Lhip:[-.16,.54,.08],Rhip:[.16,.54,.08],Lknee:[-.20,.12,.10],Lankle:[-.20,.10,.53],
    Rknee:[.20,.51,-.34],Rankle:[.20,.10,-.36],Lshoulder:[-.26,1,-.17],Rshoulder:[.26,1,-.17],
    Lelbow:[-.30,.70,-.29],Relbow:[.30,.73,-.31],Lwrist:[-.17,.65,-.40],Rwrist:[.14,.64,-.41]};
  for(const [name,v]of Object.entries(target))p[name]=blend(p[name],v,q);
  return p;
}
