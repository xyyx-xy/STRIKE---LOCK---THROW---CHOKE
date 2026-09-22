# 神社场景代码导航

来源：`/Users/mac/Desktop/code/mountain-shrine/src`，复制适配后的源码在本目录；运行不依赖原项目、Vite 或 node_modules。不要修改 dist 压缩包。

| 文件:行号 · 入口 | 内容 |
|---|---|
| `../shrine-map.js:14` createShrineMap | 总装配、背景雾、资源重新上传；:26 圆形边界，:32 风动/落叶，:37 清理动画 |
| `arena.js:2` createArena | 中央平地、石圈、地面装饰 |
| `shrine.js:2` createShrine | 神社主体、屋顶、台阶、门窗 |
| `torii.js:3` createTorii | 入口鸟居 |
| `environment.js:2,8,13,21,23,24` | pavilion 亭子、cottage 小屋、racks 架子、fox 狐像、fence 篱笆、createEnvironment 总装配 |
| `vegetation.js:3` createVegetation | 树木、草、竹林；实例化植被 |
| `materials.js:4,5,6` wind / toon / mat | 风动时间、卡通渐变材质、色板与植被着色器 |
| `lighting.js:2` createLighting | 天光、日光与阴影相机；最终阴影档位由根目录 quality.js 控制 |
| `particles.js:2` createParticles | 实例化飘落叶片，返回逐帧更新函数 |
| `components.js:4–7` animated / rng / resetSceneState | 摇摆注册、固定随机种子、每次挂载重置 |
| `components.js:8–20` mesh / box / cylinder / rock / beam / tube / sway / paper / sacredRope / lantern | 基础模型、摇摆组、纸垂、注连绳、灯笼 |
| `components.js:21,33,34` roof / stoneLantern / batchStatic | 屋顶、石灯笼、静态网格按材质合批（排除动态物体和实例化网格） |
| `collision.js:3` CollisionWorld | 源建筑碰撞资料；当前游戏仅使用中央平地圆形边界，未接入外围建筑探索 |
| `../../vendor/BufferGeometryUtils.js` mergeGeometries | 官方 Three.js 合并工具；相邻 THREE-LICENSE.txt 为许可 |

入口注册在 `../registry.js:7`，预览卡片 `../previews/shrine.svg`，验证 `../../shrine-map.test.mjs:1`。

场地半径 8.3，玩家出生 z=6，NPC 原出生圈半径 6.8。中央无障碍，clear 直接通过、steer 直接追击；不要开放台阶区域而不接入高度、寻路、尸体和血迹适配。地图共享程序生成材质只供神社使用；manager 释放 GPU 资源，重入时重置种子并重新上传材质/渐变贴图。
