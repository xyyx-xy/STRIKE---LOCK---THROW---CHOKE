# 打極投絞 · 代码导航

Three.js + WebGL 第一人称格斗原型；英文副标 **STRIKE · LOCK · THROW · CHOKE**。
「打」=打击，「極」=关节技，「投」=摔投，「絞」=绞技。已实现打击与叠肘折腕原型；主动摔投、绞技、武器尚未实现。当前有酒馆与「明庭 · 训练场」两张地图。

## 1. Agent 先读这里

- **先按下面的任务索引找模块，不必通读全部代码或历史更新。** 定位用「文件:行号 + 函数名」；部分旧代码一行包含多个逻辑段，修改前用 `rg -n` 核对。
- 每次增删改代码，同步本 README 的文件职责、入口、行号与关联关系；删除失效导航。新增代码用可读的分行格式。
- `v*.更新.md` 只写该版本改了什么，不重复代码地图。协作规则入口是 `AGENTS.md`。
- 源码在当前目录 `STRIKE · LOCK · THROW · CHOKE`；`~/Library/Caches/da-ji-tou-jiao-preview` 只是预览副本，不能只改缓存。
- 保留其他开发者改动。玩家正蹬与 NPC 正蹬有不同动画入口；改手型要同时检查玩家和 NPC。未恢复曾被用户回档的批量绘制优化。

导航核对：2026-09-21，v0.10.1；叠肘折腕更名与有效抓取必定成功。

## 2. 按任务定位

| 要改什么 | 首先读取 | 关联入口 |
|---|---|---|
| 训练人数/静止/出招/重置 | `training.js:2–32`、`training-panel.js:2` | `game.js:27,73` 装配；`combat.js:17–22` 开关 |
| 敌人追击、选招、打完不动 | `combat.js:19` 刷怪、`:22` AI、`:48` advanceEnemyAttack | `game.js:41` 显示攻击 |
| 伤害、距离、命中部位 | `combat.js:4` ATTACKS、`:15` strikeHit、`:28` specialStrike | `injury.js:7` damagePart |
| 身体/四肢建模、步态、受击 | `rig.js:4–30`，详见肢体表 | `game.js:41,44` NPC/玩家动画 |
| 拳、掌、防守手型 | `punch.js:38` showFists、`guard.js:4` guardHands | `game.js:41,44` 两方均需接入 |
| 新增单招/改动画 | `combat.js:4`、`rig.js:8`、`combos.js:2` | `bindings.js:5`、对应招式模块、`audio.js:9–12` |
| 断肢、爬行、跛行、流血 | `injury.js:2–9`、`rig.js:26–30` | `wound.js:17` 喷发与伤害分开 |
| 环境与新地图 | `maps/README.md` → `maps/registry.js:4` | `tavern.js:3` 现有酒馆；`maps/picker.js:3` 选图 |
| 画质/GPU 设置 | `quality.js:2,10`、`retro.js:4` | `game.js:60` 应用配置 |
| 按键、连招、自动保存 | `bindings.js`、`combos.js`、两个 editor 文件 | `input.js:12`、`game.js:35–40,50` |
| UI 文案、扣血提示 | `index.html:1`、`style.css` | `game.js:26,36,48,54,61` |

## 3. 运行链与状态

```text
index.html → game.js 初始化 → frame（渲染）
                            └→ simulate（固定 1/60 秒）
                               输入/连招 → 移动 → combat.tick
                               → effects → NPC/玩家骨架 → HUD
```

- `s`：战斗状态；`p`：玩家位置/视角；`e`：单个 NPC。玩家使用总生命，NPC 使用 `body` 部位血量与 `blood` 失血量，`e.hp <= 0` 表示死亡。
- `e.moves`：NPC 随机分配的 2–3 种招式；`e.atk={type,side,t,hit,zone}`：当前攻击；`wind`：剩余攻击时间；`cool`：再次出招冷却。**命中仅结算一次，收招每帧检查，不能写进 `!hit` 分支。**
- 姿态是关节点字典：`L/R + shoulder/elbow/wrist/hip/knee/ankle`；Y 向上、−Z 向前。`enemyPose` 的关节点同时用于显示和身体碰撞，改动画也要检查命中。
- `game.js` 负责装配、输入和表现；`combat.js` 负责战斗规则；地图负责环境与障碍。新增模块不要全部堆入 game.js。

## 4. 模块与入口

### 主循环、战斗与输入

| 文件:行号 · 入口 | 职责 |
|---|---|
| `game.js:15–19` renderer / playerRig | 主场景、摄像机、独立第一人称场景 |
| `game.js:23–35` notify / reset / pause / 监听器 | 状态、暂停重开、鼠标锁定、键鼠输入 |
| `game.js:36` effects | 命中/格挡/断肢/死亡事件 → 提示、血液、音效、震屏 |
| `game.js:37–40` launchCombo / pollGamepads / simulate | 连招、手柄与固定步长战斗更新 |
| `game.js:41,44–45` NPC 更新 / handPose / frame | NPC 与玩家动画、分层渲染、窗口缩放 |
| `game.js:48,50,54,60–74` updateTarget / useBinding / updateBindingLabels / refreshQuality | 部位 HUD、单招输入、按键提示、画质与切图装配 |
| `combat.js:4–8` ATTACKS / MOVE_POOL / createState / beginAttack / targetInReach | 参数、NPC 招式池、出招入口与距离朝向 |
| `combat.js:9–15,28–45` enemyParts / strikeHit / specialStrike | 身体碰撞体、最近接触、摆拳绕头/勾拳格挡规则 |
| `combat.js:16–25` down / tick | 伤势计时、刷怪、玩家命中、NPC AI、追击与拥挤分离 |
| `combat.js:48–71` advanceEnemyAttack | 单次命中、伤害与格挡、独立收招和冷却；由 tick 调用 |
| `injury.js:2–5,7–9` PARTS / initBody / damagePart / tickInjury | 部位生命倍率、断肢、击晕、失血与死亡 |
| `injury.js:6` mobility | 伤势对应移动模式/速度，动画由 rig.js 实现 |
| `movement.js:3` movePlayer | 玩家加减速、冲刺与方向换算 |
| `combos.js:2–6` MOVES / validateCombo / newPlayback / stepPlayback / loadCombos | 15 个单招目录、连招校验/播放/存储；叠肘折腕未满足抓取条件时跳过该步 |
| `bindings.js:4–19` CONTROLS / BINDING_MOVES / loadBindings | 鼠标左右键、Q/E 目录、默认值、读取与校验 |
| `bindings.js:23,27,38,45` heldGuard / pressBinding / defenseHint / readyFists | 防守优先级、出招、提示、玩家待机/踢腿手型 |
| `binding-editor.js:3,37` mountBindingEditor / save | 单招选择与恢复默认，修改即保存 |
| `combo-editor.js:3,9,13` mountComboEditor / render / save | 三栏连招、增删排序、重绑触发键、自动保存 |
| `input.js:1,2,12` INPUT_RE / inputLabel / captureInput | 触发键校验、中文标签、键鼠/手柄捕获 |

### 肢体建模与动作（按部位找）

| 文件:行号 · 入口 | 具体部分 |
|---|---|
| `rig.js:4` links | 躯干、上下臂、大小腿连接与粗细 |
| `rig.js:6–8` solveLeg / pose | 腿部 IK、站姿与步态；掌击/NPC 正蹬；其他招式分派 |
| `rig.js:9` reactPose | 命中后躯干扭转、仰头、手臂摆动、撤步 |
| `rig.js:10–13` FighterRig constructor | 骨段/关节/材质（11）；脸和头发（12）；掌、拇指、折叠手指块及拳模挂载（13） |
| `rig.js:14–17` setHands / set / react / flash | 掌型参数、关节点驱动网格、头部受击、闪光 |
| `rig.js:20–23` Ragdoll | 倒地骨段约束/重力/地面与边界；未实现完整家具支撑 |
| `rig.js:26–28` injuryPose | 缺腿双臂爬、单臂拖、无臂挪、击晕（26）；跛行/跪地（27）；防守（28） |
| `rig.js:29–30` enemyPose / setInjuries | NPC 姿态合成；隐藏断臂、断腿、断脚对应网格 |
| `punch.js:4,24,38,51` buildFist / punchPose / showFists / curvedPunchPose | 方块拳模、直拳、拳掌切换、摆拳/勾拳关键帧 |
| `guard.js:2–4` guardPose / guardBlocks / guardHands | 合臂护头、三战护躯干、格挡方向高度；三战掌心向内 |
| `snap-kick.js:3,6,21,34` SNAP_KICK / snapImpact / snapKickPose / kneelPose | 弹腿参数/效果、快速伸收腿、单膝硬直 |
| `arm-lock.js:2,3,10,16` ARM_LOCK / extendedArm / startArmLock / tickArmLock | 伸直攻击臂检测、有效抓取必定成功（100%）、抓取与延迟断臂；空挥仅播放动画 |
| `arm-lock.js:32,41,54,66` LOCK_FRAMES / armLockPose / lockedEnemyPose / lockHands | 叠臂关键帧、玩家镜像动作、敌人受控姿态；lockHands（66–96）控制前手掌心向上/拇指左侧、小臂逆时针旋转、后手向下卷指，左前手镜像；退出恢复拇指位置 |
| `game.js:41` NPC 骨架更新 | 调用 showFists：拳法用拳、掌击/防守用掌；待机/踢腿按 moves 首个手部招式，没有则用掌 |
| `game.js:44` handPose / ka / lockHands | 玩家第一人称偏移与独立正蹬关键帧；拳掌切换、叠肘折腕手型 |
| `viewmodel.js:2` updateViewVisibility | 第一人称手臂与出招腿的可见性 |
| `previews/arm-lock.html:1`、`previews/arm-lock.js:1–18` | 独立叠肘折腕检视页：双视角、滑杆、播放、镜像；不接入战斗或存档 |

手型共用 `showFists`，不要只改手指弯曲参数。玩家待机/踢腿按鼠标两键首个手部招式选拳/掌；Q/E 不影响默认手型。断肢隐藏由手部父组控制。

### 环境、渲染与特效

| 文件:行号 · 入口 | 职责 |
|---|---|
| `tavern.js:3–7` createTavern / mat / box | 酒馆工厂、背景雾、灯光、材质与方块工具 |
| `tavern.js:8–17` 环境模型 | 地板墙体（8–10）；吧台瓶架（11–12）；桌椅障碍（13–15）；吊灯窗户（16–17），后墙无牌匾 |
| `tavern.js:18–22` inside / resolve / clear / steer | 家具碰撞、攻击遮挡、NPC 绕行、边界 |
| `maps/registry.js:4,9` MAPS / loadMap | 地图工厂、名字、出生点、预览视角、卡片元数据与存储回退 |
| `maps/manager.js:3,13` mountMap / mountMapPicker 转导 | 地图挂载与资源释放，选图 UI 入口 |
| `maps/picker.js:3,14–41` mountMapPicker / render / 事件 | 卡片、场地详情、预选/取消/进入；读取注册表，不硬编码地图 |
| `maps/previews/tavern.svg` | 酒馆卡片示意图；新地图扩展协议见 `maps/README.md` |
| `quality.js:2,9,10,27` QUALITY_PRESETS / loadQuality / applyQuality / mountQualityPicker | 五档唯一配置源，像素比/MSAA/阴影、GPU 上限、自动保存 |
| `retro.js:4–15` ScenePass | 全分辨率多重采样与屏幕血迹合成；历史文件名，已不是像素滤镜 |
| `fx.js:4,7–28` splatTexture / Blood | 方格贴图、方形血滴、立方碎块、地面/墙面血迹池 |
| `fx.js:29,38,45,46,51,52` burst / explode / drip / jet / reset / step | 命中、爆散、滴血、伤口喷射、清理与粒子更新 |
| `wound.js:4,17` woundFrame / WoundJets | 跟随断口喷发 3.5 秒；game.js:36 注册、:43 更新、:27 清空；不负责扣血 |
| `audio.js:2–16` FightAudio | 本地 Web Audio 合成挥击、命中、受伤、回合音效 |

地图包含酒馆试炼与明庭训练场。改画质不重开，切换不同地图才重开。新增地图先读 `maps/README.md`，特别核对出生圈、远裁面和血液边界；不要假定任意尺寸已受支持。

### 训练场（独立地图 + 独立规则）

选图进入「明庭 · 训练场」，按 P/ESC 在暂停页调整。默认 1 人静止、不攻击；0 人可演示动作，最多 10 人。可指定六种攻击或混合、头防/躯干防/自动/不防守、追击、出招、玩家无限生命和倒地 3 秒补充。关闭追击只禁止主动移动，仍保留命中击退。修改设置自动保存并重置练习；重置按钮恢复生命/肢体并清理血迹、尸体。没有自动波次。

| 文件:行号 · 入口 | 职责 |
|---|---|
| `maps/training.js:4–30` createTraining | 庭院、网格垫、围墙、廊架、日光与边界；只负责环境 |
| `maps/registry.js:6` training | mode=training、地图元数据、出生与预览位置；卡片图为 maps/previews/training.svg |
| `training.js:2,4,12` TRAINING_DEFAULTS / validateTraining / loadTraining | 配置默认值、白名单和数量限制、存储回退 |
| `training.js:13,19,23` spawnTrainee / setupTraining / tickTraining | 排列陪练、重置状态、按槽位补充与玩家生命维护 |
| `training-panel.js:2–26` mountTrainingPanel | 暂停表单、自动保存、恢复按钮；不直接操纵场景 |
| `combat.js:17,19,21–22,56` tickTraining / tick / advanceEnemyAttack | 训练计时、禁用波次、训练防守/攻击/追击开关、无限生命；无 s.training 时走原试炼 |
| `game.js:27,45,61–74` reset / frame / refreshMapLabels / trainingPanel | 地图 mode 判定、设置挂载、重置与自由训练 HUD；切回酒馆丢弃训练战斗状态 |
| `style.css:45–46` #training-panel / .training-grid / .training-mode | 训练表单、窄屏布局、明亮场地 HUD 对比度 |
| `training.test.mjs:1–27` | 人数边界、空场、追击/攻击/防守、无限生命、延迟补充、地图挂载释放 |

### 页面、样式与本地存储

| 文件:行号 · 定位符 | 职责 |
|---|---|
| `index.html:1` title / #overlay / #combo-editor / #hint-* | 页面文案、暂停菜单、连招容器、按键提示（单行 HTML，按 ID 搜索） |
| `index.html:1` #hp / #notice / #wave / #target-health | 生命、左侧扣血提示、回合与目标部位面板 |
| `style.css:1,15,17–18` | 基础 HUD/菜单、部位面板、防守状态与连招编辑器 |
| `style.css:21–23,26–30` #notice / .binding-grid | 扣血提示布局、四键单招设置 |
| `style.css:35–38,40–43` .quality-setting / .arena-dialog | 画质设置、选图卡片与窄屏布局 |

存储键统一前缀 `da-ji-tou-jiao.`：`bindings.v1`（四键）、`combos.v1`（连招）、`quality`（画质）、`map`（地图）、`training`（训练设置）。仅当前浏览器/地址有效；不是战斗进度存档。

## 5. 开发、运行与验证

- 本地依赖 `vendor/three.module.js`；`package.json:1` 声明 ES modules，无 npm 构建。不要修改 vendor 处理业务。
- 双击 `启动试玩.command`，同步预览并打开 `http://127.0.0.1:8878/`。或源码目录运行 `python3 serve.py --port 8879`；`serve.py:9–29` 提供 no-store 本地服务。
- WASD/Shift 移动，鼠标环视；默认左键掌击、右键正蹬，Q/E 头/躯干防守，均可重绑。P/ESC 暂停；三套连招默认 1–3，可绑定键鼠/手柄，X 取消。设置自动保存。
- 全部规则检查：`node --test *.test.mjs`。UI/动画修改还需实际查看；文档修改核对路径、行号及函数名即可。

| 改动领域 | 对应测试文件 |
|---|---|
| 基础战斗、NPC 连续行动 | `combat.test.mjs`、`enemy-ai.test.mjs`（含十人 20 秒模拟） |
| 建模/步态、伤势 | `animation.test.mjs`、`injury.test.mjs` |
| 拳模/绑定、防守/连招、输入 | `punch-bindings.test.mjs`、`guard-combo.test.mjs`、`input.test.mjs` |
| 摆勾拳、弹腿、叠肘折腕 | `curved-punch.test.mjs`、`snap-kick.test.mjs`、`arm-lock.test.mjs` |
| 喷发、画质/地图 | `wound.test.mjs`、`settings.test.mjs` |

修改前用 `rg -n '函数名或选择器' 文件名` 定位，修改后用 `nl -ba 文件名` 核对导航。版本变化只追加到对应 `v*.更新.md`，不在本文件末尾继续堆叠版本章节。

叠肘折腕沿用内部 ID `armLock` 与文件 `arm-lock.js`，旧按键/连招存储兼容；显示名称在 `combos.js:2`，成功提示在 `game.js:36`，菜单在 `index.html:1`，动作预览标题在 `previews/arm-lock.html:1`。`arm-lock.js:10–15` 已移除概率判定：仍须点中伸直攻击臂，空挥与延迟断臂时序不变。`arm-lock.test.mjs:12` 验证有效抓取不调用随机数。
