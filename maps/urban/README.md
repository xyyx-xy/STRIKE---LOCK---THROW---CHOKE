# 蒼井交差点 · 场景导航

源项目：`/Users/mac/Documents/Codex/2026-09-21/three-js-webgl-anime-style-cel/outputs/urban-crossing/src`。本目录为独立复制适配，不依赖源项目、Vite、node_modules 或 dist。

| 文件:行号 · 入口 | 内容 |
|---|---|
| `../urban-map.js:14` crossingBounds | 中央路口 ±11.4 平地边界；clear 无遮挡、steer 直接追击 |
| `../urban-map.js:21,29,30` createUrbanMap / update / dispose | 总装配、广告/交通灯/尘粒更新、额外广告纹理释放 |
| `intersection.js:2–4,21` crosswalk / arrow / createIntersection / createRoadReflections | 斑马线、道路箭头、沥青地面/路缘/井盖、轻量反光 |
| `buildings.js:2,13` structure / createBuildings | 高楼、商铺、窗格、广告位置，窗格实例化 |
| `signage.js:12,39` adTexture / Signage | Canvas 原创广告绘制；billboard（41）、label（47）、update（49）控制广告与招牌、32 秒淡化周期 |
| `street-props.js:2–8` rail / streetLamp / vending / trafficLight / closure / createStreetProps | 护栏、路灯、售货机、信号灯、封路设施、地铁入口/公交站/天桥；返回信号灯更新器 |
| `materials.js:3–5,16` toon / glow / mat / prepareMaterials | 卡通色板、发光/玻璃材质、延迟生成沥青纹理；重入重新上传纹理 |
| `geometry.js:2–4,6–11,16` seeded / resetRandom / 建模组件 / Instances / batchStatic | 固定随机数、基础几何、窗格实例化、静态合批 |
| `lighting.js:2` createLighting | 蓝调天光、单盏阴影方向光、四盏非阴影点光 |
| `sky.js:2` createSky | 从原 scene.js 提取的渐变天空；不创建 renderer/相机/窗口监听 |
| `atmosphere.js:2` createAtmosphere | 34 粒尘埃及远处天桥光流 |
| `collision.js:3` CollisionWorld | 保留源建筑碰撞注册数据；当前中央战斗范围外的碰撞/跳跃未接入 |

注册：`../registry.js:8`；卡片：`../previews/urban.png`；检查：`../../urban-map.test.mjs:1`。镜头远裁面/曝光由 `../../game.js:61` 按元数据应用，切走恢复默认。材质与几何由 maps/manager.js 统一释放；shader 闭包中的备用广告纹理由适配层单独释放。

当前仅中央路口可战斗，外围街道/人行道/商铺为景观。扩大范围前需适配高度、NPC 绕行、尸体与血迹，不能只修改 half。保留原场景静态合批/实例化；不接入源项目 player.js/main.js 的第二套输入或渲染循环。
