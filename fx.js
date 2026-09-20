// Block blood: square GPU droplets, cube fragments, grid-aligned square decals.
import * as T from './vendor/three.module.js';

export function splatTexture(seed=1,size=256){const c=document.createElement('canvas');c.width=c.height=size;const g=c.getContext('2d');let r=seed%233280;const rnd=()=>(r=(r*9301+49297)%233280)/233280;
 for(let i=0;i<70;i++){const cell=16,x=Math.floor(rnd()*16)*cell,y=Math.floor(rnd()*16)*cell,n=1+Math.floor(rnd()*3);g.fillStyle=['#9e0e10','#70080a','#bc2820','#600609'][i%4];g.fillRect(x,y,n*cell,n*cell);}
 const t=new T.CanvasTexture(c);t.magFilter=t.minFilter=T.NearestFilter;t.generateMipmaps=false;t.colorSpace=T.SRGBColorSpace;return t;}
export class Blood{
 constructor(scene){this.splats=[splatTexture(7),splatTexture(119)];
  this.N=2400;this.p=new Float32Array(this.N*3);this.v=new Float32Array(this.N*3);this.a=new Float32Array(this.N);this.mi=0;
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(this.p,3));geo.setAttribute('aLife',new T.BufferAttribute(this.a,1));
  this.mistMat=new T.ShaderMaterial({uniforms:{uMap:{value:this.splats[0]}},transparent:true,depthWrite:false,
   vertexShader:'attribute float aLife;varying float vA;void main(){vA=aLife;vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=aLife>0.?clamp(36./max(-mv.z,.3),2.,26.):0.;gl_Position=projectionMatrix*mv;}',
   fragmentShader:'varying float vA;void main(){if(vA<=0.)discard;gl_FragColor=vec4(.56,.025,.035,min(1.,vA*2.));}'});
  this.mist=new T.Points(geo,this.mistMat);this.mist.frustumCulled=false;scene.add(this.mist);
  this.M=420;this.chunks=Array.from({length:this.M},()=>({life:0,x:0,y:0,z:0,vx:0,vy:0,vz:0,rx:0,ry:0,rz:0,s:1}));this.ci=0;
  this.chunkMesh=new T.InstancedMesh(new T.BoxGeometry(.085,.085,.085),new T.MeshStandardMaterial({color:0x93151a,roughness:.65}),this.M);
  this.chunkMesh.frustumCulled=false;this.chunkMesh.castShadow=true;this.dummy=new T.Object3D();
  for(let i=0;i<this.M;i++)this.chunkMesh.setMatrixAt(i,this.dummy.matrix);scene.add(this.chunkMesh);
  this.D=110;this.di=0;const dg=new T.PlaneGeometry(2,2);
  this.decalMat=new T.MeshBasicMaterial({map:this.splats[0],transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4});
  this.decals=[];for(let i=0;i<this.D;i++){const m=new T.Mesh(dg,this.decalMat);m.position.y=-9;scene.add(m);this.decals.push(m);}
  this.splatIdx=0;}
 _mist(x,y,z,vx,vy,vz,life){const i=this.mi=(this.mi+1)%this.N,j=i*3;this.p[j]=x;this.p[j+1]=y;this.p[j+2]=z;this.v[j]=vx;this.v[j+1]=vy;this.v[j+2]=vz;this.a[i]=life;}
 _chunk(x,y,z,vx,vy,vz,s){const c=this.chunks[this.ci=(this.ci+1)%this.M];Object.assign(c,{life:1.7,x,y,z,vx,vy,vz,s,rx:Math.random()*6,ry:Math.random()*6,rz:Math.random()*6});}
 _decal(x,y,z,scale,wallDir){const m=this.decals[this.di=(this.di+1)%this.D];m.material=this.decalMat;m.material.map=this.splats[this.splatIdx];m.material.needsUpdate=true;
  m.position.set(x,y,z);m.scale.setScalar(scale);
  if(wallDir){m.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),new T.Vector3(wallDir.x,0,wallDir.z).normalize());m.rotateZ(Math.floor(Math.random()*4)*Math.PI/2);}else m.rotation.set(-Math.PI/2,0,Math.floor(Math.random()*4)*Math.PI/2);
  m.visible=true;}
 burst(pos,dir,head){this.splatIdx^=1;const n=head?100:70;
  for(let i=0;i<n;i++){const sp=1.5+Math.random()*5.5,a=Math.random()*7;
   this._mist(pos.x,Math.max(.06,pos.y+(Math.random()-.35)*.25),pos.z,dir.x*sp+Math.cos(a)*2.8*Math.random(),1.5+Math.random()*3.8+Math.abs(dir.y)*2,dir.z*sp+Math.sin(a)*2.8*Math.random(),.45+Math.random()*.35);}
  const cn=head?38:24;
  for(let i=0;i<cn;i++){const a=Math.random()*7;this._chunk(pos.x,pos.y,pos.z,dir.x*(1.5+Math.random()*4)+Math.cos(a)*2.4,2.5+Math.random()*4,dir.z*(1.5+Math.random()*4)+Math.sin(a)*2.4,.5+Math.random()*1);}
  this._decal(pos.x,.04,pos.z,(head?.7:.45)+Math.random()*.35);
  const tx=Math.abs(dir.x)>.001?(11.75*Math.sign(dir.x)-pos.x)/dir.x:99,tz=Math.abs(dir.z)>.001?(10.75*Math.sign(dir.z)-pos.z)/dir.z:99,w=Math.min(tx,tz);
  if(w>0&&w<4.5)this._decal(pos.x+dir.x*w,.5+Math.random()*.9,pos.z+dir.z*w,.4+Math.random()*.3,{x:-dir.x,z:-dir.z});
  this.mistMat.uniforms.uMap.value=this.splats[this.splatIdx];}
 explode(pos,dir){this.splatIdx^=1;
  for(let i=0;i<170;i++){const sp=2+Math.random()*5.5,a=Math.random()*7,b=(Math.random()-.5)*3.5;
   this._mist(pos.x,Math.max(.06,pos.y+(Math.random()-.5)*.5),pos.z,dir.x*sp+Math.cos(a)*3.4,b+2.5+Math.random()*4.5,dir.z*sp+Math.sin(a)*3.4,.55+Math.random()*.4);}
  for(let i=0;i<48;i++){const a=Math.random()*7;this._chunk(pos.x,pos.y,pos.z,dir.x*(2+Math.random()*5)+Math.cos(a)*2.8,2+Math.random()*5.5,dir.z*(2+Math.random()*5)+Math.sin(a)*2.8,.5+Math.random()*1.1);}
  this._decal(pos.x,.04,pos.z,1.1+Math.random()*1.1);
  if(Math.random()<.7){const a=Math.random()*7;this._decal(pos.x+Math.cos(a)*.9,.04,pos.z+Math.sin(a)*.9,.5+Math.random()*.6);}
  this.mistMat.uniforms.uMap.value=this.splats[this.splatIdx];}
 drip(pos){this._mist(pos.x,pos.y,pos.z,(Math.random()-.5)*.25,-.8,(Math.random()-.5)*.25,.45);this._decal(pos.x,.04,pos.z,.10+Math.random()*.12);}
 jet(pos,dir,strength){
  for(let i=0;i<5;i++){const speed=(2+Math.random()*3)*strength;this._mist(pos.x,pos.y,pos.z,dir.x*speed+(Math.random()-.5)*.7,dir.y*speed+1.1,dir.z*speed+(Math.random()-.5)*.7,.65+Math.random()*.4);}
  this._chunk(pos.x,pos.y,pos.z,dir.x*2.5*strength,dir.y*2.5*strength+.8,dir.z*2.5*strength,.45+Math.random()*.5);
  if(Math.random()<.18)this._decal(pos.x,.04,pos.z,.16+Math.random()*.22);
 }
 reset(){this.a.fill(0);for(const c of this.chunks)c.life=0;for(const m of this.decals)m.visible=false;}
 step(dt){const g=13.5;
  for(let i=0;i<this.N;i++){if(this.a[i]<=0)continue;this.a[i]-=dt;const j=i*3;this.v[j+1]-=g*dt;
   this.p[j]+=this.v[j]*dt;this.p[j+1]+=this.v[j+1]*dt;this.p[j+2]+=this.v[j+2]*dt;
   if(this.p[j+1]<.045){this.p[j+1]=.045;this.v[j+1]*=-.22;this.v[j]*=.55;this.v[j+2]*=.55;}}
  this.mist.geometry.attributes.position.needsUpdate=true;this.mist.geometry.attributes.aLife.needsUpdate=true;
  for(let i=0;i<this.M;i++){const c=this.chunks[i];
   if(c.life<=0){this.dummy.position.set(0,-9,0);this.dummy.rotation.set(0,0,0);this.dummy.scale.setScalar(0);this.dummy.updateMatrix();this.chunkMesh.setMatrixAt(i,this.dummy.matrix);continue;}
   c.life-=dt;c.vy-=9.8*dt;c.x+=c.vx*dt;c.y+=c.vy*dt;c.z+=c.vz*dt;
   if(c.y<.035+c.s*.035){c.y=.035+c.s*.035;c.vy*=-.42;c.vx*=.66;c.vz*=.66;}
   c.x=T.MathUtils.clamp(c.x,-11.6,11.6);c.z=T.MathUtils.clamp(c.z,-10.6,10.6);
   c.rx+=c.vx*dt*3;c.ry+=c.vy*dt*2;c.rz+=c.vz*dt*3;
   this.dummy.position.set(c.x,c.y,c.z);this.dummy.rotation.set(c.rx,c.ry,c.rz);this.dummy.scale.setScalar(c.life<.2?c.s*c.life*5:c.s);
   this.dummy.updateMatrix();this.chunkMesh.setMatrixAt(i,this.dummy.matrix);}
  this.chunkMesh.instanceMatrix.needsUpdate=true;}
}
