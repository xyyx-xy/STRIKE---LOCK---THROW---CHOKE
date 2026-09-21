import * as T from '../vendor/three.module.js';

// Environment only. Training rules/settings live in ../training.js.
export function createTraining(root) {
  root.background=new T.Color(0xb9c9ce);
  root.fog=new T.Fog(0xb9c9ce,25,65);
  const geometry=new T.BoxGeometry(1,1,1),materials=new Map();
  function box(x,y,z,w,h,d,color) {
    if(!materials.has(color))materials.set(color,new T.MeshStandardMaterial({color,roughness:.9}));
    const mesh=new T.Mesh(geometry,materials.get(color));
    mesh.position.set(x,y,z);mesh.scale.set(w,h,d);mesh.receiveShadow=true;mesh.castShadow=h>.1;
    root.add(mesh);return mesh;
  }
  root.add(new T.HemisphereLight(0xf7f1da,0x677b77,2.4));
  const sun=new T.DirectionalLight(0xffedcc,2.6);sun.position.set(-7,12,5);sun.castShadow=true;
  Object.assign(sun.shadow.camera,{left:-14,right:14,top:14,bottom:-14,near:.1,far:45});root.add(sun);
  box(0,-.18,0,24,.35,22,0xa8ad9e);
  box(0,.015,0,16,.04,16,0x526f68);
  for(let i=-8;i<=8;i+=2){box(i,.041,0,.025,.008,16,0x95aaa0);box(0,.041,i,16,.008,.025,0x95aaa0);}
  for(const x of [-8,8])box(x,.055,0,.07,.018,16,0xd7bc78);
  for(const z of [-8,8])box(0,.055,z,16,.018,.07,0xd7bc78);
  // Low perimeter walls keep the training floor open and the silhouette legible.
  box(-12,1,0,.35,2,22,0xd5d3be);box(12,1,0,.35,2,22,0xd5d3be);
  box(0,1,-11,24,2,.35,0xd5d3be);box(0,.4,11,24,.8,.35,0xd5d3be);
  for(let x=-10;x<=10;x+=4){box(x,2.8,-10.7,.18,5.6,.18,0x394e48);box(x,5.5,-9,.18,.18,3.5,0x394e48);}
  for(const z of [-10.5,-9.5,-8.5,-7.5])box(0,5.6,z,22,.12,.24,0x6d8070);
  for(const x of [-10,10]){box(x,.3,1,1.1,.6,5,0x697665);box(x,1.1,1,.5,1,4.6,0x869774);}
  const bounds={x:9,z:9};
  return {bounds,resolve(e,r=.32){e.x=T.MathUtils.clamp(e.x,-bounds.x+r,bounds.x-r);e.z=T.MathUtils.clamp(e.z,-bounds.z+r,bounds.z-r);},clear:()=>true,steer:(_,p)=>p};
}
