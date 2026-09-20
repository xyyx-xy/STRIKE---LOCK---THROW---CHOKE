// Shared reference poses: parallel closed forearms, or elbows-in Sanchin guard.
export function guardPose(p,type,body=null){if(!type)return p;for(const[s,k]of[['L',-1],['R',1]]){if(body?.[s+'arm']?.gone)continue;if(type==='head'){p[s+'elbow']=[k*.095,1.34,-.31];p[s+'wrist']=[k*.095,1.74,-.33];}else{p[s+'elbow']=[k*.11,1.03,-.33];p[s+'wrist']=[k*.19,1.39,-.48];}}return p;}
export function guardBlocks(type,zone,p,attacker){if(!type||type!==zone)return false;const dx=attacker.x-p.x,dz=attacker.z-p.z,d=Math.hypot(dx,dz)||1;return (-Math.sin(p.yaw)*dx-Math.cos(p.yaw)*dz)/d>.55;}
export function guardHands(rig,type) {
  if (!type) return;
  rig.setHands(.05,.05);
  for (const side of ['L','R']) {
    const hand = rig.hands[side];
    if (!hand || !hand.group.visible) continue;
    if (type === 'torso') {
      // Native palm faces -Y. Raise fingers, then turn the palms toward +Z (self).
      // World/local-body yaw keeps fingers upright while mirroring the inward cant.
      hand.group.rotation.set(Math.PI / 2, Math.PI + (side === 'L' ? -.28 : .28), 0, 'YXZ');
    } else {
      hand.group.rotation.set(Math.PI / 2, 0, 0, 'XYZ');
    }
  }
}
