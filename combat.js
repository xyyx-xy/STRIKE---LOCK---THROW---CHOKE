import {kneeCovers,canKneeGuard,updateKneeSide} from './knee-guard.js';import {tickTraining} from './training.js';import {ARM_LOCK,startArmLock,tickArmLock} from './arm-lock.js';import {SNAP_KICK,snapImpact} from './snap-kick.js';import {guardBlocks} from './guard.js';
import {enemyPose} from './rig.js';
import {initBody,isGone,mobility,damagePart,tickInjury,bleedRate} from './injury.js';
export const ATTACKS={armLock:ARM_LOCK,snapKick:SNAP_KICK,hook:{duration:.52,active:.22,range:1.35,damage:32,push:0,cone:.74,r:.08,headFatalChance:.12},uppercut:{duration:.56,active:.24,range:1.35,damage:32,push:0,cone:.74,r:.08,headFatalChance:.12,slowDuration:3,slowFactor:.5},punch:{duration:.42,active:.14,range:1.95,damage:38,push:0,cone:.74,r:.065},palm:{duration:.34,active:.11,range:1.85,damage:30,push:4.2,cone:.72,r:.085},kick:{duration:.65,active:.25,range:2.65,damage:48,push:8,cone:.62,r:.12}};
export const MOVE_POOL=['palm','punch','kick','snapKick','hook','uppercut'];
export function createState(){return {hp:100,time:0,wave:0,kills:0,enemies:[],attack:null,sides:{snapKick:0,palm:0,kick:0,punch:0,hook:0,uppercut:0,armLock:0},waveDelay:1.5,inv:0,ended:false,nextId:0};}
export function beginAttack(s,type,context=null){if(s.ended||s.guard||!ATTACKS[type])return false;if(s.attack){const previous=s.attack;if(type!=='palm'||previous.type!=='palm'||previous.t<ATTACKS.palm.duration*.55||!previous.hit)return false;}if(type==='armLock'){if(!context)return false;const {p,arena,rng=Math.random}=context;const nearby=s.enemies.filter(e=>e.hp>0&&targetInReach(p,e,ARM_LOCK));if(!nearby.length){const side=s.sides.armLock;s.sides.armLock=1-side;s.attack={type:'armLock',side,t:0,hit:false,preview:true};return true;}const hits=nearby.filter(e=>!arena||arena.clear(p,e)).map(e=>({e,h:strikeHit(p,e,ARM_LOCK)})).filter(x=>x.h).sort((a,b)=>a.h.distance-b.h.distance);const c=hits[0];return !!c&&startArmLock(s,c.e,c.h,c.e.pose||enemyPose(c.e),rng);}s.attack={type,side:s.sides[type],t:0,hit:false};s.sides[type]^=1;return true;}
export function targetInReach(p,e,a){const dx=e.x-p.x,dz=e.z-p.z,d=Math.hypot(dx,dz);return d<=a.range+.4&&(-Math.sin(p.yaw)*dx-Math.cos(p.yaw)*dz)/Math.max(d,.001)>a.cone;}
export function enemyParts(e,p){const q=e.pose||enemyPose(e,0,0),yaw=Math.atan2(-(p.x-e.x),-(p.z-e.z)),c=Math.cos(yaw),s=Math.sin(yaw),W=v=>({x:e.x+v[0]*c+v[2]*s,y:v[1],z:e.z-v[0]*s+v[2]*c}),out=[];
 const add=(part,v,r,region)=>out.push({part,...W(v),r,region});const segment=(part,a,b,r,region)=>{const av=q[a],bv=q[b],steps=Math.ceil(Math.hypot(...av.map((v,i)=>v-bv[i]))/.065);for(let i=0;i<=steps;i++){const t=steps?i/steps:0;add(part,av.map((v,j)=>v+(bv[j]-v)*t),r,region);}};
 add('head',q.head,.22);segment('torso','hip','chest',.245);segment('torso','chest','neck',.20);
 for(const side of['L','R']){if(!isGone(e,side+'arm')){segment(side+'arm',side+'shoulder',side+'elbow',.085);segment(side+'arm',side+'elbow',side+'wrist',.085);add(side+'arm',q[side+'wrist'],.11);}if(!isGone(e,side+'leg')){segment(side+'leg',side+'hip',side+'knee',.09);segment(side+'leg',side+'knee',side+'ankle',.075,'shin');if(!isGone(e,side+'foot'))add(side+'foot',[q[side+'ankle'][0],q[side+'ankle'][1],q[side+'ankle'][2]-.09],.135);}}
 return out;}
// Swept attack volume: earliest physical contact wins, so forearms occlude the head.
export function strikeHit(p,e,c){const pitch=p.pitch||0,dir=[-Math.sin(p.yaw)*Math.cos(pitch),Math.sin(pitch),-Math.cos(p.yaw)*Math.cos(pitch)],origin=[p.x,1.63,p.z];let best=null;for(const sp of enemyParts(e,p)){if(c.ignoreArms&&sp.part.endsWith('arm'))continue;const v=[sp.x-origin[0],sp.y-origin[1],sp.z-origin[2]],along=v.reduce((n,x,i)=>n+x*dir[i],0),radius=sp.r+c.r,disc=radius*radius-(v.reduce((n,x)=>n+x*x,0)-along*along);if(disc<0)continue;const near=Math.max(0,along-Math.sqrt(disc));if(along+Math.sqrt(disc)<0||near>c.range)continue;if(!best||near<best.distance)best={part:sp.part,pos:[sp.x,sp.y,sp.z],distance:near,head:sp.part==='head',region:sp.region};}return best;}
function down(s,e,events,cause,attack){if(e.counted)return;e.counted=true;s.kills++;e.hp=0;e.wind=0;events.push({type:'down',enemy:e,head:cause==='head',cause,attack});}
export function tick(s,p,dt,arena=null,rng=Math.random){const events=[];tickTraining(s,dt);if(s.ended)return events;s.time=(s.time||0)+dt;s.inv=Math.max(0,s.inv-dt);
 for(const e of s.enemies){if(e.hp<=0)continue;initBody(e);e.slow=Math.max(0,(e.slow||0)-dt);const cause=tickInjury(e,dt);if(cause){down(s,e,events,cause);continue;}if(e.reaction){e.reaction.age+=dt;if(e.reaction.age>=e.reaction.duration)e.reaction=null;}if(bleedRate(e)>0){e.drip=(e.drip||0)+dt;if(e.drip>.45){e.drip=0;events.push({type:'bleed',enemy:e});}}}
 if(!s.training&&s.enemies.every(e=>e.hp<=0)){s.waveDelay-=dt;if(s.waveDelay<=0){s.wave++;s.waveDelay=4;const count=Math.min(2+s.wave,9);for(let i=0;i<count;i++){const a=i/count*Math.PI*2+s.wave*.75;s.enemies.push(initBody({id:s.nextId++,x:Math.sin(a)*6.8,z:Math.cos(a)*6.8,hp:100,vx:0,vz:0,cool:.9+i*.45,wind:0,stun:0,phase:i,flash:0,moves:MOVE_POOL.map(v=>[rng(),v]).sort((u,w)=>u[0]-w[0]).slice(0,2+Math.floor(rng()*2)).map(x=>x[1]),moveIdx:0}));}if(arena)for(const e of s.enemies)arena.resolve(e,.4);events.push({type:'wave'});}}
 if(s.attack?.type==='armLock')tickArmLock(s,dt,events);else if(s.attack){const a=s.attack,c=ATTACKS[a.type];a.t+=dt;if(!a.hit&&a.t>=c.active){a.hit=true;const contacts=s.enemies.filter(e=>e.hp>0&&targetInReach(p,e,c)&&(!arena||arena.clear(p,e))).map(e=>({e,h:specialStrike(p,e,c,a.type)})).filter(x=>x.h).sort((a,b)=>a.h.distance-b.h.distance);const contact=contacts[0];if(contact){if(contact.h.blocked){events.push({type:'guarded',enemy:contact.e,attack:a.type,part:contact.h.part});}else{const{e,h}=contact,result=damagePart(e,h.part,c.damage,rng);if(h.head&&c.headFatalChance&&e.hp>0&&rng()<c.headFatalChance){e.body.head.hp=0;e.hp=0;result.cause='head';result.fatal=true;}if(a.type==='uppercut'&&h.part==='torso'&&e.hp>0){e.slow=c.slowDuration;events.push({type:'slowed',enemy:e});}const knelt=a.type==='snapKick'&&snapImpact(e,h,result,rng);const d=Math.hypot(e.x-p.x,e.z-p.z)||1;e.vx=(e.x-p.x)/d*c.push;e.vz=(e.z-p.z)/d*c.push;e.stun=a.type==='kick'?.70:.4;e.wind=0;e.flash=.13;e.reaction={age:0,duration:a.type==='kick'?.95:.6,type:a.type,head:h.head,side:a.side?1:-1};events.push({type:'hit',enemy:e,attack:a.type,head:h.head,part:h.part,pos:h.pos,damage:result.damage,blocked:h.part.endsWith('arm')});if(knelt)events.push({type:'kneeling',enemy:e});if(result.severed)events.push({type:'sever',enemy:e,part:h.part,pos:h.pos});if(result.stunned)events.push({type:'stunned',enemy:e});if(result.cause)down(s,e,events,result.cause,a.type);}}else events.push({type:'miss'});}if(a.t>=c.duration)s.attack=null;}
 for(const e of s.enemies){if(e.hp<=0)continue;e.flash=Math.max(0,e.flash-dt);e.x+=e.vx*dt;e.z+=e.vz*dt;e.vx*=Math.exp(-5*dt);e.vz*=Math.exp(-5*dt);e.stun=Math.max(0,e.stun-dt);e.cool-=dt;const dx=p.x-e.x,dz=p.z-e.z,d=Math.hypot(dx,dz)||1,profile=mobility(e),arms=Number(!isGone(e,'Larm'))+Number(!isGone(e,'Rarm')),canAttack=arms>0&&!(e.kneel>0)&&profile.mode!=='stunned';e.guard=canAttack&&d<3&&e.wind<=0&&e.stun<=0&&profile.mode!=='crawl'&&profile.mode!=='drag'?(s.training&&s.training.guard!=='auto'?(s.training.guard==='none'?null:s.training.guard):(e.id%2?'torso':'head')):null;updateKneeSide(e);
 if(e.ko>0||e.kneel>0){e.wind=0;e.atk=null;}else if(e.stun===0){if(e.atk){advanceEnemyAttack(s,p,e,dt,arena,profile,arms,canAttack,d,events);}else if(e.cool<=0&&canAttack&&(!s.training||s.training.attacking)){const pool=e.moves&&e.moves.length?e.moves:['palm'],avail=pool.filter(m=>d<ATTACKS[m].range*.95),m=avail.length?avail[Math.floor(rng()*avail.length)]:null,c=m&&ATTACKS[m];if(m&&(!arena||arena.clear(e,p))){e.attackCount=(e.attackCount||0)+1;const side=isGone(e,'Larm')?1:isGone(e,'Rarm')?0:e.id%2;const zone=(profile.mode==='crawl'||profile.mode==='drag')?'torso':(['punch','hook','uppercut'].includes(m))?'head':(e.attackCount+e.id)%2?'head':'torso';e.atk={type:m,side,t:0,hit:false,zone};e.wind=c.duration;e.attackSide=side;e.attackZone=zone;}else if(d>1.05&&(!s.training||s.training.moving)){const speed=(1.15+Math.min(s.wave,8)*.15)*profile.speed*(e.slow>0?ATTACKS.uppercut.slowFactor:1),target=arena?arena.steer(e,p):p,tx=target.x-e.x,tz=target.z-e.z,td=Math.hypot(tx,tz)||1;e.x+=tx/td*speed*dt;e.z+=tz/td*speed*dt;}}else if(d>1.05&&(!s.training||s.training.moving)){const speed=(1.15+Math.min(s.wave,8)*.15)*profile.speed*(e.slow>0?ATTACKS.uppercut.slowFactor:1),target=arena?arena.steer(e,p):p,tx=target.x-e.x,tz=target.z-e.z,td=Math.hypot(tx,tz)||1;e.x+=tx/td*speed*dt;e.z+=tz/td*speed*dt;}}
 e.x=Math.max(-(arena?.bounds?.x||7.5),Math.min(arena?.bounds?.x||7.5,e.x));e.z=Math.max(-(arena?.bounds?.z||7.5),Math.min(arena?.bounds?.z||7.5,e.z));}
 const alive=s.enemies.filter(e=>e.hp>0);for(let i=0;i<alive.length;i++){const a=alive[i];for(const b of alive.slice(i+1)){let dx=b.x-a.x,dz=b.z-a.z,d=Math.hypot(dx,dz);if(d<.72){if(d<.001){dx=.01;d=.01;}const v=(.72-d)*.5;a.x-=dx/d*v;a.z-=dz/d*v;b.x+=dx/d*v;b.z+=dz/d*v;}}const dx=p.x-a.x,dz=p.z-a.z,d=Math.hypot(dx,dz);if(d<.7&&d>.001){p.x+=dx/d*(.7-d);p.z+=dz/d*(.7-d);}}
 p.x=Math.max(-(arena?.bounds?.x||7.5),Math.min(arena?.bounds?.x||7.5,p.x));p.z=Math.max(-(arena?.bounds?.z||7.5),Math.min(arena?.bounds?.z||7.5,p.z));if(arena){arena.resolve(p);for(const e of alive)arena.resolve(e,.36);}if(s.hp<=0)s.ended=true;return events;}

// Curved punches aim at the same body volumes, with explicit guard coverage.
export function specialStrike(p,e,config,type) {
  const direct=strikeHit(p,e,config);if(direct&&e.guard==='knee'&&e.stun<=0&&!(e.ko>0)&&!(e.kneel>0)&&canKneeGuard(e.body)&&kneeCovers(type,direct.part))return {...direct,blocked:true};
  if(type!=='hook'&&type!=='uppercut')return direct;
  const target=strikeHit(p,e,{...config,ignoreArms:true});
  if(!target||!['head','torso'].includes(target.part))return direct;
  const arms=['Larm','Rarm'].filter(part=>!isGone(e,part));
  const guarding=e.guard&&e.stun<=0&&!(e.ko>0)&&arms.length;
  const covered=guarding&&((target.part==='torso'&&e.guard==='torso')||(type==='uppercut'&&target.part==='head'&&e.guard==='head'));
  if(covered){
    // Damage the defending arm, never the protected head/body or its special proc.
    const part=direct?.part.endsWith('arm')?direct.part:arms[0];
    const arm=enemyParts(e,p).find(v=>v.part===part);
    return {...target,part,head:false,pos:[arm.x,arm.y,arm.z]};
  }
  // A lateral hook passes around a closed high guard to the exposed temple.
  if(type==='hook'&&target.part==='head')return target;
  return direct;
}

// Contact resolves once; recovery must run every attack frame, even after a miss/block.
function advanceEnemyAttack(s,p,e,dt,arena,profile,arms,canAttack,d,events) {
  const a=e.atk,c=ATTACKS[a.type];
  a.t+=dt;
  e.wind=Math.max(0,c.duration-a.t);
  if(!a.hit&&a.t>=c.active) {
    a.hit=true;
    if(canAttack&&d<c.range&&s.inv===0&&(!arena||arena.clear(e,p))) {
      const zone=a.zone,blocked=guardBlocks(s.guard,zone,p,e,a.type);
      if(!blocked&&!s.training?.invincible) {
        s.hp=Math.max(0,s.hp-Math.round(c.damage*(profile.mode==='crawl'||profile.mode==='drag'?.45:.38)));
        const pd=Math.hypot(p.x-e.x,p.z-e.z)||1;
        p.x+=(p.x-e.x)/pd*c.push*.06;
        p.z+=(p.z-e.z)/pd*c.push*.06;
      }
      s.inv=.6;
      events.push({type:blocked?'block':'hurt',zone,guard:s.guard,move:a.type,heavy:a.type==='kick'||a.type==='snapKick'});
    }
  }
  if(a.t>=c.duration) {
    e.atk=null;
    e.wind=0;
    e.cool=arms===1?2.1:1.45;
  }
}
