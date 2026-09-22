import * as THREE from '../../vendor/three.module.js';import {mat} from './materials.js';import {box,group,Instances,random} from './geometry.js';
function structure(scene,world,windows,config){const {x,z,w,d,h,tone=0}=config;const g=group(scene,x,0,z);box(g,mat.building[tone%5],0,h/2,0,w,h,d);world.box(x,z,w,d,0,h);
 // The commercial podium has deep frames, glass doors and a projecting canopy.
 box(g,mat.dark,0,2.4,0,w+.16,4.8,d+.16);box(g,mat.metal,0,4.85,0,w+.5,.25,d+.5);box(g,mat.stone,0,h-.4,0,w+.3,.25,d+.3);
 for(const side of [0,1,2,3]){const horizontal=side%2===0,faceLength=horizontal?w:d,angle=side*Math.PI/2;const f=group(g,horizontal?0:Math.sin(angle)*w/2,0,horizontal?Math.cos(angle)*d/2:0,angle);
  for(let v=-faceLength/2+1;v<faceLength/2;v+=2){box(f,mat.glass,v,2.2,.07,1.76,3.65,.1,false);box(f,mat.metal,v-.95,2.2,.15,.1,4.2,.1);box(f,mat.stone,v,2.4,.17,1.76,.05,.06,false);}
  for(let yy=6;yy<h-1.2;yy+=2.45){box(f,mat.metal,0,yy-.98,.025,faceLength,.075,.12,false);for(let v=-faceLength/2+.85;v<faceLength/2-.4;v+=1.4){const lit=random()>.25;const wx=x+(horizontal?v:Math.sin(angle)*(w/2+.06)),wz=z+(horizontal?Math.cos(angle)*(d/2+.06):-Math.sin(angle)*v);const palette=lit?(random()>.67?'#d9ba8a':'#8faecb'):'#29415b';windows.add(wx,yy,wz,1.02,1.52,.04,angle,palette);}}
  for(let v=-faceLength/2;v<=faceLength/2;v+=4.2)box(f,mat.stone,v,h/2,.07,.09,h-.8,.14,false);
 }
 for(let i=0;i<3;i++){box(g,mat.metal,-w*.3+i*w*.25,h+.55,0,1.5,1.1,2);box(g,mat.black,-w*.3+i*w*.25,h+1.13,0,1.6,.12,2.1);}
 return g;
}
export function createBuildings(scene,world,signs){const windows=new Instances(new THREE.BoxGeometry(1,1,1),mat.window);
 // Broad podiums define all four corners; setbacks keep the central skyline legible.
 structure(scene,world,windows,{x:-22,z:-22,w:16,d:16,h:31,tone:0});
 structure(scene,world,windows,{x:22,z:-22,w:16,d:16,h:39,tone:1});
 structure(scene,world,windows,{x:-22,z:22,w:16,d:16,h:26,tone:3});
 structure(scene,world,windows,{x:22,z:22,w:16,d:16,h:33,tone:2});
 for(const x of [-36,36])for(const z of [-18,1,20])structure(scene,world,windows,{x,z,w:10,d:z===1?19:16,h:33+random()*18,tone:Math.floor(random()*5)});
 for(const z of [-39,40])for(const x of [-23,0,23])structure(scene,world,windows,{x,z,w:17,d:10,h:28+random()*23,tone:Math.floor(random()*5)});
 // Distant silhouette: simple, higher masses rather than expensive facade detail.
 for(let i=0;i<28;i++){const a=i/28*Math.PI*2,r=62+random()*15,h=35+random()*38,x=Math.sin(a)*r,z=Math.cos(a)*r;box(scene,mat.building[i%5],x,h/2,z,6+random()*7,h,8+random()*7);box(scene,mat.metal,x,h+.5,z,2,1,2);}
 windows.finish(scene);
 // Setback crowns and vertical fins give each hero building a distinct silhouette.
 box(scene,mat.building[0],-23,33,-23,11,4,11);box(scene,mat.dark,-23,35.2,-23,11.5,.25,11.5);
 box(scene,mat.building[2],-24,36.5,-24,7,2.5,7);box(scene,mat.pink,-24,37.8,-24,7.2,.08,7.2,false);
 box(scene,mat.glass,23,42,-23,10,6,10);box(scene,mat.metal,23,45.2,-23,10.5,.3,10.5);
 for(let y=39.5;y<45;y+=1.2)box(scene,mat.cyan,23,y,-17.96,10,.04,.04,false);
 box(scene,mat.metal,26,47,-24,.08,4,.08);box(scene,mat.red,26,49,-24,.11,.12,.11,false);
 for(const x of [-29,-27,-17,-15])box(scene,mat.stone,x,26.5,-13.88,.32,8,.34);
 for(const x of [16,20,24,28])box(scene,mat.dark,x,30.5,-13.82,.19,12,.36);
 // Hero boards face the intersection, with four intentionally different color identities.
 signs.billboard(scene,-22,13.8,-13.77,14.5,8.15,'lunar');
 signs.billboard(scene,22,17.2,-13.77,14.6,8.2,'cyan');
 signs.billboard(scene,-13.77,15,-22,12,7,'amber',Math.PI/2);
 signs.billboard(scene,13.77,12,-22,12,7,'violet',-Math.PI/2);
 signs.billboard(scene,-22,12.5,13.77,13,7.3,'amber',Math.PI);
 signs.billboard(scene,22,14,13.77,13,7.3,'violet',Math.PI);
 signs.billboard(scene,-13.77,12,22,12,6.75,'lunar',Math.PI/2);
 signs.billboard(scene,13.77,16,22,12,6.75,'cyan',-Math.PI/2);
 signs.billboard(scene,0,12,-33.8,14,7.8,'violet');
 signs.label(scene,'月波 RECORDS',-22,21,-13.7,13.5,1.35,{bg:'#272440',color:'#f2b3dc'});
 signs.label(scene,'AOI  /  蒼井百貨',22,24,-13.7,14,1.6,{bg:'#d7efed',color:'#205370'});
 signs.label(scene,'夜景喫茶',-15.2,7.5,-13.7,2.1,3.4,{bg:'#b5665c',color:'#fff1cd'});
 signs.label(scene,'空音',15.2,8,-13.7,2.1,4,{bg:'#364b76',color:'#ccecff'});
 signs.label(scene,'HOSHIKA HOTEL',0,22,-33.8,14,1.2,{bg:'#273858',color:'#c0d5f6'});
 signs.label(scene,'24 / NIGHT MARKET',-22,4,-13.65,14,.9,{bg:'#eee5b8',color:'#215658'});
 signs.label(scene,'蒼井  GALLERIA',22,4,-13.65,14,1,{bg:'#223551',color:'#dcfaff'});
 signs.label(scene,'KISSA  /  喫茶',-13.65,4,-22,11,.9,{bg:'#763e51',color:'#ffdaac',rotation:Math.PI/2});
 signs.label(scene,'SORANE STUDIO',13.65,4,-22,11,.9,{bg:'#444575',color:'#e1deff',rotation:-Math.PI/2});
 signs.label(scene,'AKARI BOOKS',-22,4,13.65,13,1,{bg:'#51443b',color:'#eedda3',rotation:Math.PI});
 signs.label(scene,'NAMI MART',22,4,13.65,13,1,{bg:'#2b6b76',color:'#daffff',rotation:Math.PI});
 for(const [x,z,rot,color] of [[-22,-13.4,0,mat.pink],[22,-13.4,0,mat.cyan],[-22,13.4,Math.PI,mat.amber],[22,13.4,Math.PI,mat.blue]]){const g=group(scene,x,0,z,rot);box(g,mat.dark,0,3.2,.48,15,.22,1.4);box(g,color,0,3.09,1.16,14.8,.045,.04,false);for(const v of [-5,0,5]){box(g,mat.metal,v,1.6,.1,2.4,2.8,.15);box(g,mat.glass,v,1.6,.22,2.12,2.5,.04);box(g,mat.stone,v,1.6,.27,.06,2.5,.045,false);}}
 // Architectural neon fins, restrained to building edges.
 for(const [x,z,h,color] of [[-29.9,-13.87,29,mat.pink],[29.9,-13.87,37,mat.cyan],[-13.87,-29.9,29,mat.amber],[13.87,-29.9,37,mat.blue]])box(scene,color,x,h/2,z,.11,h,.11,false);
}
