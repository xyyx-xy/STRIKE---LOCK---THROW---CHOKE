// Knee shield blocks frontal kicks below the head; punches remain effective.
export function kneeCovers(move,part) {
  return ['kick','snapKick'].includes(move)&&['torso','leg','foot','Lleg','Rleg','Lfoot','Rfoot'].includes(part);
}
export function canKneeGuard(body) {
  return !['Lleg','Rleg','Lfoot','Rfoot'].some(part=>body?.[part]?.gone);
}
export function kneeGuardPose(p,body=null,side=0) {
  if(!canKneeGuard(body))return p;
  const leg=side?'R':'L',hip=p[leg+'hip'];
  p[leg+'knee']=[hip[0],hip[1]+.28,hip[2]-Math.sqrt(.43**2-.28**2)];
  p[leg+'ankle']=[hip[0],p[leg+'knee'][1]-.41,p[leg+'knee'][2]+Math.sqrt(.43**2-.41**2)];
  return p;
}

// Tiny inward offset clears the forearm without pushing the knee below the view.
export function kneeGuardViewPose(p,guard,side=0) {
  if(hasKneeGuard(guard))for(const key of ['hip','knee','ankle'].map(part=>(side?'R':'L')+part)){
    p[key][0]+=side?-.06:.06;
  }
  return p;
}

export function hasKneeGuard(guard){return guard==='knee'||guard==='headKnee';}
// One side per activation; adding/removing head guard never switches the lifted leg.
export function updateKneeSide(state){
  const active=hasKneeGuard(state.guard);
  if(active&&!state.kneeActive){state.kneeSide=state.nextKneeSide||0;state.nextKneeSide=1-state.kneeSide;}
  state.kneeActive=active;
}
export function combinedCovers(move,part){
  if(!['palm','punch','hook','uppercut','kick','snapKick'].includes(move))return false;
  return part==='head'||['leg','foot','Lleg','Rleg','Lfoot','Rfoot'].includes(part)||kneeCovers(move,part);
}
