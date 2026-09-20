import * as T from './vendor/three.module.js';
// Original LAST CALL environment: matching geometry, layout, materials and lighting; signs omitted.
export function createTavern(scene){
scene.background=new T.Color('#19241f');scene.fog=new T.FogExp2('#19241f',.027);
scene.add(new T.HemisphereLight(0xb5c6ad,0x4a2c1b,2.0));const sun=new T.DirectionalLight(0xffcf87,2.6);sun.position.set(3,9,5);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-13,right:13,top:13,bottom:-13});scene.add(sun);
const materials=new Map();function mat(c){if(!materials.has(c))materials.set(c,new T.MeshStandardMaterial({color:c,roughness:.86}));return materials.get(c);}
const cube=new T.BoxGeometry(1,1,1);function box(w,h,d,c,x=0,y=0,z=0,parent=scene){const m=new T.Mesh(cube,mat(c));m.scale.set(w,h,d);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
box(24,.3,22,'#4a3829',0,-.16,0);for(let x=-12;x<12;x+=1.2){for(let z=-11;z<11;z+=2.8)box(1.17,.035,2.76,(Math.floor(x*7+z)%3===0?'#564431':'#604a35'),x+.6,.015,z+1.4);}
box(24,6,.4,'#243c33',0,3,-11);box(.4,6,22,'#263b32',-12,3,0);box(.4,6,22,'#263b32',12,3,0);box(24,6,.4,'#263b32',0,3,11);
for(let x=-11;x<=11;x+=2)box(.09,1.3,.15,'#8c6841',x,.7,-10.7);box(24,.13,.2,'#906e49',0,1.4,-10.65);for(let x=-10;x<=10;x+=5)box(.32,6,.4,'#533f2a',x,3,-10.6);
box(13,1.35,1.4,'#523927',0,.68,-7.6);box(13.4,.16,1.65,'#a67b47',0,1.43,-7.6);box(12,.12,.6,'#997348',0,2.4,-10.5);box(12,.12,.6,'#997348',0,3.45,-10.5);
for(let i=0;i<28;i++){let x=(i%14)*.8-5.2,y=i<14?2.7:3.76;box(.16,.5,.16,['#35543b','#a47a37','#8b3d28'][i%3],x,y,-10.4);box(.07,.15,.07,'#b69b64',x,y+.32,-10.4);}
const obstacles=[{x:0,z:-7.6,w:13.4,d:1.65}],props=[];
function chair(x,z,angle=0){const g=new T.Group();g.position.set(x,0,z);g.rotation.y=angle;scene.add(g);box(.72,.12,.7,'#906639',0,.68,0,g);box(.72,.65,.1,'#755331',0,1.06,.29,g);for(let a of [-.27,.27])for(let b of [-.25,.25])box(.1,.65,.1,'#493421',a,.33,b,g);props.push({g,x,z,v:new T.Vector3(),fall:0});obstacles.push({x,z,w:.72,d:.7});}
for(const [x,z]of[[-6,-2],[6,-2],[-6,5],[6,5]]){box(2.3,.16,1.8,'#997347',x,1.1,z);for(let a of[-.9,.9])for(let b of[-.65,.65])box(.14,1,.14,'#453525',x+a,.5,z+b);obstacles.push({x,z,w:2.3,d:1.8});chair(x,z+1.6);chair(x,z-1.6,Math.PI);box(.2,.4,.2,'#496846',x-.5,1.38,z);}
for(let x of [-9,-3,3,9]){box(.05,1.2,.05,'#24241b',x,5.4,-4);const shade=new T.Mesh(new T.ConeGeometry(.65,.4,8),mat('#bb8750'));shade.position.set(x,4.7,-4);scene.add(shade);const light=new T.PointLight(0xffb95c,24,10,2);light.position.set(x,4.4,-4);scene.add(light);}
for(let z of[-4,3,8]){box(.08,2.6,2.5,'#b79e61',-11.72,3.2,z);box(.1,2.4,2.3,'#54878a',-11.65,3.2,z);box(.14,.1,2.4,'#252f26',-11.55,3.2,z);box(.14,2.5,.1,'#252f26',-11.55,3.2,z);}
const inside=(p,o,r=.32)=>Math.abs(p.x-o.x)<o.w/2+r&&Math.abs(p.z-o.z)<o.d/2+r;
function resolve(p,r=.32){p.x=T.MathUtils.clamp(p.x,-11.35,11.35);p.z=T.MathUtils.clamp(p.z,-10.3,10.3);for(let pass=0;pass<3;pass++)for(const o of obstacles){if(!inside(p,o,r))continue;const candidates=[{x:o.x-o.w/2-r-.005,z:p.z},{x:o.x+o.w/2+r+.005,z:p.z},{x:p.x,z:o.z-o.d/2-r-.005},{x:p.x,z:o.z+o.d/2+r+.005}].filter(c=>Math.abs(c.x)<=11.35&&Math.abs(c.z)<=10.3).sort((a,b)=>Math.hypot(a.x-p.x,a.z-p.z)-Math.hypot(b.x-p.x,b.z-p.z));if(candidates.length)Object.assign(p,candidates[0]);}return p;}
function clear(a,b,r=.02){const steps=Math.ceil(Math.hypot(a.x-b.x,a.z-b.z)/.08);for(let i=0;i<=steps;i++){const t=steps?i/steps:0;if(obstacles.some(o=>inside({x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t},o,r)))return false;}return true;}
function steer(a,b){if(clear(a,b,.35))return b;const nodes=[];for(const o of obstacles)for(const sx of[-1,1])for(const sz of[-1,1]){const n={x:o.x+sx*(o.w/2+.48),z:o.z+sz*(o.d/2+.48)};if(Math.abs(n.x)<11.35&&Math.abs(n.z)<10.3&&clear(a,n,.34))nodes.push(n);}nodes.sort((x,y)=>(Math.hypot(x.x-a.x,x.z-a.z)+Math.hypot(x.x-b.x,x.z-b.z)+(clear(x,b,.34)?0:6))-(Math.hypot(y.x-a.x,y.z-a.z)+Math.hypot(y.x-b.x,y.z-b.z)+(clear(y,b,.34)?0:6)));return nodes[0]||b;}
return {obstacles,resolve,clear,steer,bounds:{x:11.35,z:10.3}};}
