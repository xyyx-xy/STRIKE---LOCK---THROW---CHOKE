// ADD MAPS HERE: import a factory and register its stable id. See maps/README.md.
import {createTavern} from '../tavern.js';
export const MAPS={
  tavern:{name:'最后一杯 · 酒馆',subtitle:'暖灯、木桌与近身交锋',description:'灯光未熄，最后一杯还在吧台。穿过桌椅，拉近距离，在狭窄的酒馆里以拳脚决胜。',tags:['室内场地','桌椅障碍','近身交锋'],thumbnail:'maps/previews/tavern.svg',create:createTavern,spawn:{x:0,z:7.5,yaw:0,pitch:0},preview:{eye:[8,3.3,8],target:[0,1.7,-3]}}
};
export const DEFAULT_MAP='tavern';
export function loadMap(storage){try{const id=storage.getItem('da-ji-tou-jiao.map');return Object.hasOwn(MAPS,id)?id:DEFAULT_MAP;}catch{return DEFAULT_MAP;}}
