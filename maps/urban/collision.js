// Vertical capsule approximated by a horizontal circle and a height interval.
// Axis-aligned footprints keep broad-phase checks inexpensive and predictable.
export class CollisionWorld {
 constructor(){this.solids=[];this.platforms=[];}
 box(x,z,w,d,minY=0,maxY=12){this.solids.push({type:'box',x,z,w:w/2,d:d/2,minY,maxY});}
 circle(x,z,r,minY=0,maxY=20){this.solids.push({type:'circle',x,z,r,minY,maxY});}
 platform(x,z,w,d,y){this.platforms.push({x,z,w:w/2,d:d/2,y});}
 ground(x,z,feet,step=.035){let h=0;for(const p of this.platforms)if(Math.abs(x-p.x)<=p.w&&Math.abs(z-p.z)<=p.d&&p.y<=feet+step)h=Math.max(h,p.y);return h;}
 resolve(pos,radius=.32,height=1.72){
  for(let pass=0;pass<4;pass++)for(const s of this.solids){if(pos.y>=s.maxY-.001||pos.y+height<=s.minY)continue;
   if(s.type==='circle'){let dx=pos.x-s.x,dz=pos.z-s.z,l=Math.hypot(dx,dz),need=s.r+radius;if(l<need){if(l<1e-8){pos.x+=need;continue;}pos.x+=dx/l*(need-l);pos.z+=dz/l*(need-l);}}
   else {const cx=Math.max(s.x-s.w,Math.min(pos.x,s.x+s.w)),cz=Math.max(s.z-s.d,Math.min(pos.z,s.z+s.d));let dx=pos.x-cx,dz=pos.z-cz,l=Math.hypot(dx,dz);
    if(l>0&&l<radius){pos.x+=dx/l*(radius-l);pos.z+=dz/l*(radius-l);}
    else if(l===0){const px=s.w+radius-Math.abs(pos.x-s.x),pz=s.d+radius-Math.abs(pos.z-s.z);if(px<pz)pos.x+=(pos.x>=s.x?1:-1)*px;else pos.z+=(pos.z>=s.z?1:-1)*pz;}
   }
  } return pos;
 }
 move(pos,dx,dz,radius=.32){const steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.12));for(let i=0;i<steps;i++){const oldX=pos.x,oldZ=pos.z;pos.x+=dx/steps;pos.z+=dz/steps;
  const ground=this.ground(pos.x,pos.z,pos.y);pos.y=Math.max(pos.y,ground);this.resolve(pos,radius);
  // High ledges are represented by solids; walkable steps are low platforms.
  if(!Number.isFinite(pos.x+pos.z)){pos.x=oldX;pos.z=oldZ;}
 }return pos;}
}
