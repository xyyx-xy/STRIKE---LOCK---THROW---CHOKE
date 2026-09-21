# 地图开发入口

**新增地图先改 `maps/registry.js`，场景建模单独放在 `maps/<地图名>.js`。** 当前仅酒馆，旧实现为根目录 `tavern.js`；没有麦田地图。

1. 新建工厂 `export function createExample(root)`，所有地板、灯光、家具均添加到传入 root。设置 root.background、root.fog，不操作全局游戏场景。
2. 返回 arena 接口：`bounds:{x,z}`（以原点为中心的场地半宽/半深）、`resolve(entity,radius=.32)`（修改 x/z，约束边界及家具）、`clear(a,b,radius=.02)`（判断两点连线是否无障碍）、`steer(enemy,player)`（返回 AI 应前往的 x/z）。可选 `update(seconds)` 更新动画，`dispose()` 清理事件或专属资源。
3. 在 registry.js import 工厂，加入稳定 ID：`example:{name:'地图名',create:createExample,spawn:{x:0,z:7.5,yaw:0,pitch:0},preview:{eye:[8,3.3,8],target:[0,1.7,-3]}}`。菜单会自动出现，不要在 game.js 增加地图名分支。
4. manager.js 负责独立环境挂载及释放；工厂创建的资源归地图独占，不要与玩家/NPC 共用几何材质。切换会重开战斗、清空尸体血迹，保留按键/招式。
5. 画质由根目录 quality.js 统一控制，地图不要自行覆盖像素比或阴影档位。需要投影的灯设置 castShadow=true。
6. 当前战斗出生圈半径 6.8（combat.js:19），玩家摄像机远裁面 70，血液边界仍沿用酒馆尺寸（fx.js），所以新增不同尺寸地图时要一起适配这三处；不要仅扩大场景模型。当前接口并不意味着任意大小地图已自动支持。
7. 增加地图后验证出生点、边界、家具挡拳、寻路、三档以上画质切换、反复切图资源释放，并同步主 README 的文件/函数/行号导航。

导航：registry.js:3 地图目录，:7 存储回退；manager.js:3 挂载/释放，picker.js:3 选图 UI；game.js:68 切图入口（以主 README 最新导航为准）。

## 选图卡片资料

注册条目可增加 `subtitle`（副标题）、`description`（介绍）、`tags`（字符串数组）和 `thumbnail`（相对 index.html 的图片路径，例如 maps/previews/example.svg）。`maps/picker.js` 自动生成卡片和详情，不要在页面硬编码地图 ID。预览可使用 SVG 示意图或真实截图。用户先选择卡片，再点击「进入地图」保存并入场；关闭面板不会重开战斗。
