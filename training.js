import {initBody} from './injury.js';
export const TRAINING_DEFAULTS={count:1,moving:false,attacking:false,guard:'none',move:'punch',invincible:true,respawn:true};
const moves=['palm','punch','hook','uppercut','kick','snapKick'];
export function validateTraining(raw={}) {
  const out={...TRAINING_DEFAULTS};
  out.count=Number.isFinite(Number(raw.count))?Math.max(0,Math.min(10,Math.round(Number(raw.count)))):1;
  for(const key of ['moving','attacking','invincible','respawn'])if(typeof raw[key]==='boolean')out[key]=raw[key];
  if(['none','head','torso','auto'].includes(raw.guard))out.guard=raw.guard;
  if([...moves,'mixed'].includes(raw.move))out.move=raw.move;
  return out;
}
export function loadTraining(storage){try{return validateTraining(JSON.parse(storage.getItem('da-ji-tou-jiao.training'))||{});}catch{return {...TRAINING_DEFAULTS};}}
export function spawnTrainee(s,index) {
  const columns=Math.min(s.training.count,5),row=Math.floor(index/5),col=index%5;
  return initBody({id:s.nextId++,x:(col-(columns-1)/2)*1.8,z:2-row*2.2,hp:100,vx:0,vz:0,
    cool:.8+index*.15,wind:0,stun:0,phase:index,flash:0,trainingSlot:index,
    moves:s.training.move==='mixed'?[...moves]:[s.training.move]});
}
export function setupTraining(s,config) {
  s.training=validateTraining(config);s.wave=0;s.enemies=[];s.trainingTimers={};
  for(let i=0;i<s.training.count;i++)s.enemies.push(spawnTrainee(s,i));
}
export function tickTraining(s,dt) {
  if(!s.training)return;
  if(s.training.invincible){s.hp=100;s.ended=false;}
  for(let i=0;i<s.training.count;i++){
    if(s.enemies.some(e=>e.trainingSlot===i&&e.hp>0)){delete s.trainingTimers[i];continue;}
    if(!s.training.respawn)continue;
    s.trainingTimers[i]=(s.trainingTimers[i]||0)+dt;
    if(s.trainingTimers[i]>=3){s.enemies=s.enemies.filter(e=>e.trainingSlot!==i);s.enemies.push(spawnTrainee(s,i));delete s.trainingTimers[i];}
  }
}
