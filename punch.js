import * as T from './vendor/three.module.js';

// Solid block fist: one flat striking face, no individual fingers. Local forward is -Z.
export function buildFist(material, side) {
  const group = new T.Group();
  const geometry = new T.BoxGeometry(1, 1, 1);
  const block = (name, size, position) => {
    const mesh = new T.Mesh(geometry, material);
    mesh.name = name;
    mesh.scale.set(...size);
    mesh.position.set(...position);
    mesh.castShadow = true;
    group.add(mesh);
  };
  // Broad hand mass with a single folded-finger slab, as in the reference.
  block('fist-palm', [.17, .115, .145], [0, .006, -.043]);
  block('knuckle-face', [.17, .105, .082], [0, -.009, -.115]);
  const inner = side === 'L' ? 1 : -1;
  block('outside-thumb', [.047, .057, .092], [inner * .077, -.043, -.060]);
  group.visible = false;
  return group;
}

export function punchPose(p, attack) {
  const side = attack.side ? 'R' : 'L', k = attack.side ? 1 : -1;
  const t = Math.max(0, Math.min(.42, attack.t));
  const smooth = x => x * x * (3 - 2 * x);
  const extension = t < .14 ? smooth(t / .14) : 1 - smooth((t - .14) / .28);
  const mix = (a, b) => a.map((n, i) => n + (b[i] - n) * extension);
  p[side + 'elbow'] = mix(p[side + 'elbow'], [k * .16, 1.44, -.60]);
  p[side + 'wrist'] = mix(p[side + 'wrist'], [k * .075, 1.52, -1.08]);
  p[side + 'shoulder'][2] -= extension * .10;
  p.chest[2] -= extension * .045;
  return p;
}

// Open palms retain their original mesh/pose. Only punch hands use this model.
export function showFists(rig, pose, attack, guard, ready = false) {
  for (const side of ['L', 'R']) {
    const hand = rig.hands[side];
    const closed = (!guard || guard === 'knee') && (!attack || ['kick','snapKick'].includes(attack.type) ? ready : ['punch','hook','uppercut'].includes(attack.type));
    for (const child of hand.group.children) child.visible = child === hand.fist ? closed : !closed;
    if (closed) {
      const direction = new T.Vector3(...pose[side + 'wrist']).sub(new T.Vector3(...pose[side + 'elbow'])).normalize();
      hand.group.quaternion.setFromUnitVectors(new T.Vector3(0, 0, -1), direction);
    }
  }
}

// Mirrored wind-up, curved contact and recovery; both reuse the solid fist model.
export function curvedPunchPose(p,attack) {
  const side=attack.side?'R':'L',k=attack.side?1:-1;
  const hook=attack.type==='hook',active=hook?.22:.24,duration=hook?.52:.56;
  const frames=hook?
    [[0,p[side+'wrist'],p[side+'elbow']], [.10,[k*.56,1.48,-.40],[k*.57,1.30,-.14]], [active,[k*.04,1.57,-.91],[k*.41,1.48,-.54]], [duration,p[side+'wrist'],p[side+'elbow']]]:
    [[0,p[side+'wrist'],p[side+'elbow']], [.11,[k*.24,1.02,-.35],[k*.29,.98,-.14]], [active,[k*.09,1.59,-.85],[k*.20,1.24,-.54]], [duration,p[side+'wrist'],p[side+'elbow']]];
  const t=Math.max(0,Math.min(duration,attack.t));
  for(let i=1;i<frames.length;i++)if(t<=frames[i][0]){
    const a=frames[i-1],b=frames[i],v=(t-a[0])/(b[0]-a[0]),u=v*v*(3-2*v);
    for(const [name,j]of[['wrist',1],['elbow',2]])p[side+name]=a[j].map((x,n)=>x+(b[j][n]-x)*u);
    break;
  }
  p.chest[0]+=k*Math.sin(t/duration*Math.PI)*.045;
  return p;
}
