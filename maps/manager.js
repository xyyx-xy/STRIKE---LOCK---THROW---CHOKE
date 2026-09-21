import * as T from '../vendor/three.module.js';
import {MAPS,DEFAULT_MAP} from './registry.js';
export function mountMap(scene,id){
  const entry=MAPS[id]||MAPS[DEFAULT_MAP],root=new T.Scene(),arena=entry.create(root);
  scene.add(root);scene.background=root.background;scene.fog=root.fog;
  return {...arena,entry,dispose(){
    arena.dispose?.();const geometries=new Set(),materials=new Set(),textures=new Set();
    root.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)for(const m of(Array.isArray(o.material)?o.material:[o.material]))materials.add(m);if(o.isInstancedMesh)o.dispose();o.shadow?.dispose();});
    for(const m of materials){for(const v of Object.values(m))if(v?.isTexture)textures.add(v);m.dispose();}
    for(const g of geometries)g.dispose();for(const t of textures)t.dispose();scene.remove(root);root.clear();
  }};
}
export {mountMapPicker} from './picker.js';
