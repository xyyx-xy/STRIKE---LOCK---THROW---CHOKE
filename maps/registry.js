// ADD MAPS HERE: import a factory and register its stable id. See maps/README.md.
import {createUrbanMap} from './urban-map.js';import {createShrineMap} from './shrine-map.js';import {createTraining} from './training.js';
import {createTavern} from '../tavern.js';
export const MAPS={
  tavern:{name:'最后一杯 · 酒馆',subtitle:'暖灯、木桌与近身交锋',description:'灯光未熄，最后一杯还在吧台。穿过桌椅，拉近距离，在狭窄的酒馆里以拳脚决胜。',tags:['室内场地','桌椅障碍','近身交锋'],thumbnail:'maps/previews/tavern.svg',create:createTavern,spawn:{x:0,z:7.5,yaw:0,pitch:0},preview:{eye:[8,3.3,8],target:[0,1.7,-3]}},
  training:{name:'明庭 · 训练场',mode:'training',subtitle:'磨炼一招，进退有度',description:'日光下的开放练习庭院。自由设置对手人数、移动、攻击与防守，反复试招，或清空场地演示动作。',tags:['自由训练','可调对手','动作演示'],thumbnail:'maps/previews/training.svg',create:createTraining,spawn:{x:0,z:4.4,yaw:0,pitch:0},preview:{eye:[9,7,10],target:[0,0,-1]}},
  shrine:{bright:true,name:'深山 · 神社',subtitle:'风过鸟居，林间决斗',description:'穿林而来的日光落在石圈上。神社、鸟居与杉林环绕圆形决斗场，在开阔平地展开拳脚交锋。战斗范围以中央石圈为界。',tags:['圆形决斗场','卡通光影','风动林木'],thumbnail:'maps/previews/shrine.svg',create:createShrineMap,spawn:{x:0,z:6,yaw:0,pitch:0},preview:{eye:[7,3,8],target:[0,2,-13]}},
  urban:{name:'蒼井 · 交差点',far:210,exposure:1.16,subtitle:'蓝调夜色，霓虹交锋',description:'月波唱片与蒼井百货点亮蓝调夜色。广告缓缓变换，信号灯轮转，在中央斑马线围成的平地路口展开交锋。外围街道与商铺作为景观。',tags:['都市夜景','动态广告','开阔路口'],thumbnail:'maps/previews/urban.png',create:createUrbanMap,spawn:{x:0,z:7.5,yaw:0,pitch:0},preview:{eye:[7,3,9],target:[-5,8,-16]}}
};
export const DEFAULT_MAP='tavern';
export function loadMap(storage){try{const id=storage.getItem('da-ji-tou-jiao.map');return Object.hasOwn(MAPS,id)?id:DEFAULT_MAP;}catch{return DEFAULT_MAP;}}
