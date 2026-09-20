// Acceleration and exponential drag adapted from the supplied blood-town demo.
// Exact integration keeps acceleration/displacement consistent across frame rates.
export function movePlayer(p,input,dt){
 const f=input.forward||0,r=input.right||0,n=Math.max(1,Math.hypot(f,r));
 const speed=input.sprint?4.1:3.35,drag=9.2,decay=Math.exp(-drag*dt);
 const tx=(-Math.sin(p.yaw)*f+Math.cos(p.yaw)*r)/n*speed;
 const tz=(-Math.cos(p.yaw)*f-Math.sin(p.yaw)*r)/n*speed;
 p.vx??=0;p.vz??=0;
 p.x+=tx*dt+(p.vx-tx)*(1-decay)/drag;p.z+=tz*dt+(p.vz-tz)*(1-decay)/drag;
 p.vx=tx+(p.vx-tx)*decay;p.vz=tz+(p.vz-tz)*decay;
}
