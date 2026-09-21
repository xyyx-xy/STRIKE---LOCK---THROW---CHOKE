# 打極投絞 · 酒馆试炼 / DA JI TOU JIAO

Three.js + WebGL 第一人称近战原型。所有运行依赖均在本地，无需联网。

标题固定写作 **《打極投絞》**，顺序为「打 → 極 → 投 → 絞」。品牌标题保留繁体汉字，操作与说明使用简体中文。英文副标：**STRIKE · LOCK · THROW · CHOKE**。

| 字 | 日语术语 | 对应技法 | 含义 |
|---|---|---|---|
| 打 | 打撃 | 打击 | 拳、踢、肘、膝等站立击打技术。 |
| 極 | 極め／極め技 | 关节技 | 锁控关节、迫使对手降服的技术，例如十字固、臂锁、膝锁。 |
| 投 | 投げ | 投技／摔技 | 破坏对手平衡，将其摔倒在地。 |
| 絞 | 絞め | 绞技 | 作用于颈部、限制血流或呼吸的降服技术，例如裸绞、断头台、三角绞。 |

「極」专指这里的关节技，不是“极致打击”，也不与「絞」混为一类。视觉采用四项等权排列，对应四种不同技术。

当前仅开放 **「打」· 酒馆打击试炼**：拳峰直拳、掌击、正蹬、走位、受击与击倒。「極」「投」「絞」尚未实现；受击倒地不等同于主动投技。

## 协作必读：代码与文档同步规则

本文件是项目的当前代码地图，所有开发者和智能体开始修改前先读这里。

1. **每次新增、删除、移动或修改代码，都必须同步更新本 README 的文件职责、函数入口、行号和关联关系。** 删除文件/函数时同时移除失效导航；行号偏移时重新核对。不要等到大版本发布才维护。
2. 定位使用「文件 + 行号 + 函数名/选择器」三项。当前代码有不少单行多语句，行号只负责快速跳转，函数名/选择器负责精确定位。不可仅凭旧行号直接改代码。
3. `v*.更新.md` 只记录对应版本改了什么；环境、肢体、系统结构、运行方法、验证命令集中在 README，不把更新日志当成开发手册。
4. 源码在本目录（当前文件夹名 `STRIKE · LOCK · THROW · CHOKE`，游戏标题仍为《打極投絞》）；`~/Library/Caches/da-ji-tou-jiao-preview` 是启动器生成的预览副本。修改源码后同步预览，不要只改缓存。
5. 保留其他开发者已有修改，尤其 v0.1 正蹬分段、第一人称踢腿关键帧及掌形。涉及它们时同时核对下列多个入口。

导航核对日期：2026-09-21（画质与地图扩展）。新增代码请采用可读的分行格式。

## 运行环境与操作

- 原生 ES modules、Three.js / WebGL、HTML / CSS；运行依赖在 `vendor/three.module.js`，无构建步骤、无需联网。`package.json` 声明 ES module。
- 使用支持 WebGL 的桌面浏览器；本地服务需要 Python 3，自动化检查需要 Node.js。
- 双击 `启动试玩.command`：复制源码到预览缓存，启动本机 `http://127.0.0.1:8878/`。源码更新后重新运行启动器。
- 也可在本目录运行 `python3 serve.py --port 8879` 直接预览源码。不要依赖 `file://` 下 ES module 的浏览器行为。
- WASD 走位、Shift 快步、鼠标环视；方向键也可转向。默认左键交替掌击，右键交替正蹬；可在暂停页的「按键单招」独立修改鼠标左右键、Q、E。
- 默认按住 Q 护头、E 护躯干；匹配高度的正面攻击可格挡。P / ESC 暂停；锁定鼠标失败时使用直接环视。
- 可选固定左右摆拳、勾拳、直拳（拳峰）、掌击、正蹬、弹腿和两种防守；六种攻击均可选择左右交替。攻击每次按下触发一次（长按不连发），防守按住维持。手动单招中断连招，暂停/失焦清除按住状态。
- 暂停页编排十四种单招，三套招式分别按 1 / 2 / 3 施放，X 取消剩余动作；每套最多 12 步，防守 0.2–3 秒。保存仅属于当前浏览器、当前地址。
- 清空一回合后间隔 4 秒进入下一回合；从 3 人逐步增加至最多 9 人。生命耗尽后可再战。

## 代码执行顺序与数据

`index.html` → `game.js` 初始化场景、玩家和编辑器 → `frame()` 渲染循环 → 固定 1/60 秒 `simulate()` → `combat.tick()` 战斗与伤势 → `effects()` 处理事件 → 更新骨架、第一人称和 HUD。

- 玩家状态 `s` 包含生命、攻击、波次、对手、击倒计数；位置/视角在 `p`。NPC 的 `e.hp` 是存活标记，具体部位生命在 `e.body`，独立血量在 `e.blood`。
- 姿态是关节点字典，例如 `Lshoulder / Lelbow / Lwrist`（左肩/肘/腕）、`Lhip / Lknee / Lankle`（左髋/膝/踝）。R 为右侧；局部坐标 Y 向上、−Z 向前。
- `enemyPose()` 生成的同一套关节点供显示和 `enemyParts()` 命中检测使用。改肢体位置时必须核对碰撞，不能只改显示。
- 玩家暂用总生命；NPC 才有分部位受伤、失血、断肢。关节技、主动摔投、绞技、武器及完整游戏存档尚未实现。自定义招式已有本地存储。

## 环境、酒馆与渲染在哪里

**新增地图从 `maps/README.md` 开始。地图注册在 `maps/registry.js`，工厂放 maps/ 目录；当前仅酒馆，无麦田。画质统一配置在 `quality.js`。**

| 文件与行号 | 入口/部分 | 负责内容 |
|---|---|---|
| `tavern.js:3–7` | `createTavern`、`mat`、`box` | 场景背景、雾、主光、材质缓存、方块构建工具 |
| `tavern.js:8–10` | 地板、墙、木装饰 | 24 × 22 酒馆主体，沿用《最后一杯》环境，后墙无牌匾 |
| `tavern.js:11–12` | 吧台、瓶架、酒瓶 | 后方吧台陈设 |
| `tavern.js:13–15` | `obstacles`、`chair`、桌椅循环 | 家具模型、布局和障碍物注册 |
| `tavern.js:16–17` | 吊灯、窗户 | 吊灯模型与点光源、侧墙窗 |
| `tavern.js:18–22` | `inside / resolve / clear / steer` | 家具碰撞修正、近战遮挡、NPC 绕行、场地边界 |
| `game.js:15–17` | `renderer / camera / arena / handsScene` | 渲染器、主摄像机、酒馆入口、独立第一人称手脚场景 |
| `game.js:45` | `frame / resize` | 主场景和手脚的分层渲染、视角、震动、窗口尺寸 |
| `retro.js:4–15` | `ScenePass` | 全分辨率、多重采样、屏幕血迹合成；文件名兼容历史，已非像素渲染 |

## 肢体建模、动画与伤势在哪里

| 文件与行号 | 入口/部分 | 负责内容 |
|---|---|---|
| `rig.js:4` | `links` | 躯干、上臂、小臂、大腿、小腿的骨段连接、宽深尺寸和材质分类 |
| `rig.js:6` | `solveLeg` | 双段腿部 IK，膝盖朝前，避免后退时反关节 |
| `rig.js:7` | `pose` 基础姿态 | 身高、肩髋位置、站姿、前后左右步态、抬脚 |
| `rig.js:8` | `pose` 的 `attack` 分支 | 左右掌击、正蹬提膝/伸腿/收腿、躯干与手臂配合；直拳分支转交 `punchPose` |
| `rig.js:9` | `reactPose` | 命中后的扭身、仰头、弯腰、手臂摆动、受击撤步 |
| `rig.js:10–11` | `FighterRig.constructor` | 方块骨段和关节、皮肤/衣服/裤子材质、头手脚端点模型 |
| `rig.js:12` | 头部附属网格 | 眼睛、眉毛、鼻、嘴、头发 |
| `rig.js:13–14` | 手掌网格、`setHands` | 掌、手指两节、拇指构建和开合，保留用户掌形；同时挂载独立 `buildFist` 模型 |
| `rig.js:15–17` | `set / react / flash` | 关节点驱动网格位置旋转缩放、头部受击转动、起手/受击发光 |
| `rig.js:20–23` | `Ragdoll` | 倒地位置约束、重力、地面摩擦和边界；未做完整自碰撞及家具支撑 |
| `rig.js:26` | `injuryPose` 爬行分支 | 缺腿双臂爬行、单臂拖行、无臂挪行、击晕伏地 |
| `rig.js:27–28` | `injuryPose` 站立分支 | 单脚缺失跛行、调用 NPC 防守姿态 |
| `rig.js:29` | `enemyPose` | 组合基础动作、攻击高度、受击和伤势姿态 |
| `rig.js:30` | `FighterRig.prototype.setInjuries` | 断臂、断腿、断脚后隐藏对应网格、关节和手掌 |
| `guard.js:2–18` | `guardPose / guardBlocks / guardHands` | 合臂护头、三战护躯干的肘腕位置；玩家格挡方向/高度；`guardHands`（第 4 行）将三战双掌转向自身 +Z，指尖朝上，左右镜像，玩家/NPC 共用 |
| `game.js:17–19` | `playerRig` 初始化 | 第一人称模型的摄像机挂载和位置 |
| `game.js:41` | NPC 骨架更新 | 世界坐标、朝向、步速、手型、防守、断肢显示、受击反馈 |
| `game.js:44` | `handPose`、`ka` 正蹬分支 | 第一人称手臂偏移、玩家踢腿关键帧；与 `rig.js:8` 的第三人称正蹬分别维护 |
| `viewmodel.js:2–8` | `updateViewVisibility` | 第一人称只显示小臂和手；踢腿时显示对应整条腿直到收招 |
| `injury.js:2–5` | `PARTS / initBody / isGone / bleedRate` | 部位血量、伤害倍率、断肢状态及出血速率 |
| `injury.js:6` | `mobility` | 伤势决定站立/跛行/缓行/三种爬行动作及速度 |
| `injury.js:7–9` | `damagePart / tickInjury` | 扣部位血、概率击晕、断肢、头/躯干致命、持续失血致死 |

## 战斗、输入、招式与反馈在哪里

| 文件与行号 | 入口/部分 | 负责内容 |
|---|---|---|
| `combat.js:4–7` | `ATTACKS / createState / beginAttack / targetInReach` | 攻击伤害、击退、距离、时长、连击收招限制、初始状态；punch：伤害 38、无击退仅踉跄；palm：伤害 30、击退 4.2；kick：伤害 48、击退 8 |
| `combat.js:8–14` | `enemyParts / strikeHit` | 随姿态更新的身体碰撞体、最先接触部位；实体手臂可替头承伤 |
| `combat.js:15–19` | `down / tick` 前半 | 伤势计时、死亡计数、刷波次、玩家攻击结算与受击事件 |
| `combat.js:20–24` | `tick` 后半 | NPC 防守/攻击 AI、攻击高度、玩家格挡、追击、拥挤分离、场地碰撞 |
| `movement.js:3` | `movePlayer` | 玩家移动加速、减速、冲刺和方向换算 |
| `game.js:23–35` | 状态、`notify / reset / pause`、输入监听 | 暂停、重开、鼠标锁定、键盘和鼠标绑定；keydown/mousedown 先查 `savedCombos` 的 `input` 触发栏位连招，未命中才走单招；扣血提示由 `notify` 写入 |
| `game.js:37–39` | `launchCombo / updateComboHints / pollGamepads` | 按栏位播放或提示空栏、页脚 `#combo-hint` 文本同步、手柄按键上升沿触发连招 |
| `game.js:36` | `effects` | `hit / hurt / block / sever / bleed / down / wave` 事件映射到文字、血液、音效、停顿和震屏；hit 提示按招式标注「击退」（掌击）或「踉跄」（直拳） |
| `game.js:40` | `simulate` | 每个模拟步先轮询手柄触发键，再处理手动防守、连招、移动、战斗和模型姿态 |
| `game.js:45–48` | `frame / updateTarget`、部位行初始化 | 玩家生命、波次、击倒计数、瞄准部位、目标血条和失血数值 |
| `combos.js:1–5` | `MOVES / validateCombo / newPlayback / stepPlayback / loadCombos` | 十四种单招目录、输入校验（含 `input` 触发键，经 `input.js` 的 `INPUT_RE`）、按收招时序播放、读取三套招式并补默认触发键 |
| `combo-editor.js:2–13` | `mountComboEditor`、`render`、各按钮监听 | 暂停页增删排序、命名、时长、栏位切换、自动保存；触发键行「重绑触发键」捕获键盘/鼠标/手柄输入后实时显示中文标签；存储键 `da-ji-tou-jiao.combos.v1` |
| `fx.js:4–28` | `splatTexture / Blood.constructor` 及内部方法 | 程序血迹贴图、方形血滴（2400）、立方体碎块（420）、方格地面/墙面血迹池（110） |
| `fx.js:29–51` | `burst / explode / drip / reset` | 普通命中、增强爆散、方块滴血、重开清理 |
| `fx.js:52–65` | `Blood.step` | 粒子生命周期、重力、弹跳及 GPU 数据更新 |
| `audio.js:2–16` | `FightAudio`、`unlock / play` | Web Audio 合成挥击、命中、倒地、受伤及回合音效 |

## 直拳与按键设置入口

| 文件与行号 | 入口/部分 | 负责内容 |
|---|---|---|
| `punch.js:4` | `buildFist` | 独立握拳模型：整体掌体、无分指的平整拳面、简化外扣拇指（参考图块状轮廓）；局部 −Z 是打击方向 |
| `punch.js:24` | `punchPose` | 直拳肘腕关键帧、肩部前送，0.14 秒到达最大伸展后收招 |
| `punch.js:38` | `showFists` | 第一人称拳模/原有张掌切换、拳峰与小臂对齐；待机和踢腿按鼠标左右键手部招式保持拳/掌，防守恢复张掌 |
| `bindings.js:15` | `validateBindings` | 四键动作白名单与默认配置回退 |
| `bindings.js:19` | `loadBindings` | 独立存储键 da-ji-tou-jiao.bindings.v1，旧连招不变 |
| `bindings.js:23` | `heldGuard` | 按下次序决定同时按住的防守优先级，松开后恢复其他仍按住的防守 |
| `bindings.js:27` | `pressBinding` | 鼠标/Q/E 共用攻击入口，固定左右侧、交替、格挡互斥与失败回滚 |
| `bindings.js:38` | `defenseHint` | 高/中段提示跟随真实按键，不再写死 Q/E |
| `binding-editor.js:3` | `mountBindingEditor` | 在暂停招式页插入四个选择器与恢复默认按键，change 后立即生效并自动保存 |
| `game.js:50` | `useBinding` | 中断连招并调用映射后的单招及音效 |
| `game.js:54` | `updateBindingLabels` | 同步鼠标左右键、Q、E 的底部 HUD 文本 |
| `bindings.js:4–15` | `CONTROLS / BINDING_MOVES / DEFAULT_BINDINGS / BINDINGS_KEY` | 四个可改按键、十四个单招及六种交替选项、默认映射和存储键 |
| `input.js:1` | `INPUT_RE` | 触发键 ID 白名单：`Mouse0–4`、`PadN`、`e.code` 风格的键盘按键 |
| `input.js:2–10` | `inputLabel` | 触发键 ID 到中文标签（鼠标左键、手柄按键 1、空格等） |
| `input.js:12–20` | `captureInput` | 一次性捕获任意键盘/鼠标/手柄输入，返回取消函数；供连招编辑器重绑触发键使用 |

直拳沿用原有瞄准方向的扫掠命中判定（`combat.strikeHit`），拳峰模型和动作独立；未加入逐网格刚体碰撞。`game.js:2–4` 导入新模块，`game.js:24` 挂载按键设置；`index.html:1` 的 `#hint-Mouse0 / #hint-Mouse2 / #hint-KeyQ / #hint-KeyE` 是动态按键提示。

## 页面、文本与样式在哪里

| 文件与行号 | 定位符 | 负责内容 |
|---|---|---|
| `index.html:1` | `title / header / .creed / #copy` | 页面标题、品牌、四法释义和菜单说明（当前 HTML 为单行，按 ID 搜索） |
| `index.html:1` | `.stats / #hp / #bar / #notice / #wave / #remaining / #kills` | 左侧生命与扣血提示、中间回合、右侧击倒；`#notice` 位于生命栏内部 |
| `index.html:1` | `#target-health / .part-row` | 右侧目标分部位生命面板 |
| `index.html:1` | `#overlay / #combo-editor / #combo-steps` | 暂停、设置、自定义招式编辑器结构 |
| `style.css:1` | `header / .stats / footer / #overlay` | 基础 HUD、菜单、字体、生命条和主要响应式布局 |
| `style.css:15` | `#target-health / .part-row` | 目标部位面板尺寸和高亮 |
| `style.css:17–18` | `#action-state / #combo-editor` | 防守/连招状态文字、编辑器与窄屏适配 |
| `style.css:21–23` | `.stats section:first-child / #notice` | 扣血/格挡等提示锚定左侧生命条下方，含窄屏宽度与换行 |
| `style.css:26–30` | `#binding-editor / .binding-grid / #binding-message` | 暂停页四键设置布局、保存状态、窄屏单列 |

## 启动文件、依赖与验证

| 文件 | 职责 |
|---|---|
| `启动试玩.command:1–18` | macOS 一键同步缓存、launchctl 启动本机 8878 服务、打开浏览器 |
| `serve.py:9–29` | Python HTTP 服务参数、no-store 响应头、仅监听 127.0.0.1 |
| `package.json:1` | Node ES module 声明；没有 npm 构建和依赖安装步骤 |
| `vendor/three.module.js` | 随项目提供的 Three.js 库；不要把业务修改写进依赖 |
| `combat.test.mjs` | 出招、距离、伤害、收招、波次、玩家移动、倒地及第一人称可见性 |
| `animation.test.mjs` | 步态 IK、受击恢复及家具遮挡 |
| `injury.test.mjs` | 部位伤害顺序、实体遮挡、断肢、失血、各种移动状态 |
| `guard-combo.test.mjs` | 防守姿态、正背面/高度格挡、连招顺序/收招和存储 |
| `punch-bindings.test.mjs` | 拳峰朝向、拳模与张掌切换、直拳命中/收招、四键重绑、防守释放、存储及双拳连招 |
| `input.test.mjs` | 触发键 ID 白名单、中文标签映射、连招 `input` 字段校验与默认回退 |
| `AGENTS.md:1–6` | 智能体协作入口，要求先读 README 并同步维护代码地图 |
| `v*.更新.md` | 各版本变更记录，不承担代码导航职责 |

运行规则/动画检查：

```sh
node --test *.test.mjs
```

纯 HUD 位置修改用浏览器验证：扣血提示在左侧生命条下面，长文换行，不与中央回合、人数重叠；同时检查窄屏。改肢体/战斗后运行对应检查并实际查看动作。更新导航可用 `nl -ba 文件名` 查看行号，或 `rg -n '函数名|选择器' 文件名` 精确定位。

## 方块血液与断口喷发

- `fx.js` 的 `splatTexture` 仅绘制方格、使用最近邻采样；GPU 血滴为实心正方形，碎块为 BoxGeometry，地面/墙面/屏幕血迹共用方块贴图。
- 普通命中 70 个方滴 + 24 个血块；头部 100 + 38；爆散 170 + 48。使用固定容量循环池限制开销。
- `wound.js:4–15` 的 `woundFrame` 从剩余肩、髋、踝断口取世界位置和喷射方向，跟随站立、爬行、倒地骨架。当前受伤系统没有独立手指部位，喷发对应断臂/断腿/断脚。
- `wound.js:17–37` 的 `WoundJets`：每个断口喷发 3.5 秒，每秒 24 次喷射，逐渐减弱；暂停冻结，重开清空，移除尸体停止，断腿替换同侧脚断口。失血伤害仍由 injury.js 管理。
- `game.js` 的 `effects(sever)` 登记伤口，`simulate` 在骨架更新后发射，`reset` 清空。
- `fx.js:46`：`Blood.jet`。
- `fx.js:29`：`Blood.burst`。
- `fx.js:38`：`Blood.explode`。
- `fx.js:51`：`Blood.reset`。
- `fx.js:52`：`Blood.step`。
- `wound.test.mjs:1–19`：断口跟随、喷发到期、不同帧率计数、断腿覆盖脚伤口、尸体移除与重开清理。

## 摆拳与勾拳（v0.6）

- `combat.js:4` 的 ATTACKS：hook=摆拳、uppercut=勾拳，距离均 1.35，低于掌击 1.85 和直拳 1.95；基础伤害 32，push=0，无击退。头部即死概率 headFatalChance=0.12。勾拳躯干减速 slowFactor=0.5、slowDuration=3 秒，重复命中刷新时长、不叠加倍率。
- `combat.js:19` 的 tick 玩家命中结算调用 specialStrike，只有真正命中头部才判即死、命中躯干才施加减速；防守由手臂承伤。`combat.js:17` 衰减 slow 计时，`combat.js:21` 将减速应用于追击移动。
- `combat.js:27` 的 specialStrike：摆拳绕过头部合臂防守；三战遮挡摆拳/勾拳的躯干攻击，头防遮挡勾拳的头部攻击。缺失双臂后不能格挡；家具遮挡、距离、最近对手判断仍由 tick 处理。
- `combos.js:2` 新增 hookL/R、uppercutL/R；单招绑定和连招编辑器自动读取目录，原有保存数据兼容。
- `rig.js:1` 导入 curvedPunchPose，`rig.js:8` 在原出招前分派摆拳/勾拳；不改变原掌击和正蹬关键帧。
- `punch.js:38` 的 showFists 让两种新招使用块状拳模。
- `game.js` 的 effects 显示躯干减速提示，updateTarget 显示减速状态；手型判断纳入摆拳/勾拳。
- `audio.js:9–12` 让两种新招接入挥拳与拳击命中音效。
- `curved-punch.test.mjs` 验证两种防守、绕头、短距离、无击退、即死计数、减速及动作恢复；`guard-combo.test.mjs` 的招式数量更新为 12，`punch-bindings.test.mjs` 遍历目录校验四键支持新招。
- `punch.js:51` 的 curvedPunchPose：摆拳侧向蓄力横扫、勾拳下沉上挑，左右镜像，完整收招。

## 自动保存与交替单招（v0.7）

- `bindings.js:7–11`：hookAlt、uppercutAlt、palmAlt、kickAlt、punchAlt 五种交替攻击；`pressBinding` 复用战斗状态中的独立左右计数，仅成功出招换侧，固定左右招式仍可选。
- `binding-editor.js:29` 的 onchange 调用 `save`（第 37 行）：每次选择后更新游戏映射并写入本地存储；第 44–49 行恢复默认也立即保存。
- `combo-editor.js:13` 的 save：校验当前栏位、更新运行中连招和本地存储。第 6 行重绑触发键、第 9 行防守时长/删除/排序、第 11 行名称输入、第 12 行添加动作均调用 save；切换栏位无需另存。
- `index.html:1`：删除 #combo-save 手动按钮，#combo-message 改为自动保存说明。存储失败时两个编辑器均提示仅本次生效。
- `punch-bindings.test.mjs` 新增五种交替攻击的连续出招与失败不换侧检查。界面自动保存须验证修改后刷新仍保留，测试结束恢复原配置。

## 弹腿与单膝硬直（v0.7）

- `snap-kick.js:3` 的 SNAP_KICK：0.085 秒命中、0.26 秒收招、距离 2.15、基础伤害 12（v0.7.2 下调，定位为精准控制技）、无击退；小腿断腿概率 20%，头/躯干单膝硬直概率 30%，硬直 3 秒。
- `snap-kick.js:6–18` 的 snapImpact：正常伤害后判定额外效果。仅 shin 碰撞触发断腿，沿用现有整腿损毁、脚隐藏、流血和爬行系统；大腿/手臂不触发断腿特效。存活头/躯干可硬直，触发时清除普通头部击晕，重复触发刷新为 3 秒。死亡不再附加硬直。
- `snap-kick.js:21–32` 的 snapKickPose：快速提膝、伸小腿、回弹、落脚，左右镜像；`rig.js:1,8` 导入并分派。`viewmodel.js:3` 为弹腿显示出招侧整腿，原正蹬关键帧仍在 game.js:44。
- `snap-kick.js:34–44` 的 kneelPose：左膝落地、右脚支撑、低头收臂；0.16 秒下跪，最后 0.24 秒起身。`rig.js:27` 在断腿/击晕爬行分支后应用，缺腿不强行跪地。
- `combat.js:9–14` 为小腿段附加 region=shin 并传入命中结果；第 19 行调用 snapImpact、发出 kneeling/sever 事件；第 20–21 行禁止硬直期间防守、攻击与主动移动。
- `injury.js:6,9` 的 mobility/tickInjury：单膝状态标签、零移动速度和计时；`game.js:36` 显示硬直提示，第 48 行目标面板沿用 mobility 标签。
- `combos.js:2` 新增 snapKickL/R；`bindings.js:6` 新增 snapKickAlt；单招四键自动保存与连招目录自动接入。`audio.js:10,12` 复用踢击音效。
- `snap-kick.test.mjs:1–47`：概率分支、小腿/躯干实际命中、断腿存活与流血、3 秒行动禁用和恢复、单膝关节姿态、左右弹腿与第一人称显示；原目录和交替测试同步扩大到 14 单招/6 种交替。

## 踢腿手型修复（v0.7.1）

- `bindings.js:45` 的 readyFists：只查询 Mouse0/Mouse2 手部攻击。直拳/摆拳/勾拳用拳，掌击用掌；两键均为腿法或无手部攻击则用掌。两键分别为拳与掌时，以左键手部招式作为稳定默认；Q/E 不影响默认手型。
- `punch.js:41` 的 showFists：待机、正蹬、弹腿均沿用 ready 手型；实际手部出招仍使用该招拳/掌模型，防守优先。
- `game.js:3,44`：导入 readyFists 并用于第一人称；踢腿时 setHands 沿用待机张掌参数，避免拇指突然变形。
- `punch-bindings.test.mjs`：覆盖两种腿法、左右腿、拳腿/掌腿/双腿绑定、Q/E 不干扰以及防守覆盖。

## 五档画质与选图入口

本次基于用户回档版本，不恢复此前的批量绘制优化。开始/暂停菜单的画质自动保存；选图面板点击卡片预选，点击进入地图后自动保存并入场；关闭取消预选。画质立即生效且不重开战斗，切图才重开。默认中档。旧麦田存储值回退酒馆。

| 档位 | 像素比上限 | MSAA | 阴影尺寸 |
|---|---:|---:|---:|
| 超低 | 0.65 | 0 | 关闭 |
| 低 | 0.85 | 0 | 512 |
| 中 | 1.25 | 2 | 1024 |
| 高 | 1.7 | 4 | 2048 |
| 超高 | 2 | 4 | 4096 |

实际采样/阴影尺寸按显卡能力封顶；像素比不超过设备像素比。仅改变渲染，不影响人数、血液数量、伤害和动作。超高可能增加 GPU 负担。

| 文件与行号 | 入口/职责 |
|---|---|
| `quality.js:2–9` | QUALITY_PRESETS / loadQuality，五档唯一数值源，存储键 da-ji-tou-jiao.quality |
| `quality.js:10–26` | applyQuality，分辨率、阴影开关/尺寸、GPU 能力限制、MSAA 缓冲重建 |
| `quality.js:27–34` | mountQualityPicker，#quality-select，自动保存与失败提示 |
| `maps/registry.js:3–7` | MAPS / DEFAULT_MAP / loadMap，注册工厂/名字/出生点/预览视角；选图数据源 |
| `maps/manager.js:3–12` | mountMap，隔离地图场景、复制背景雾、切图释放几何/材质/贴图/阴影 |
| `maps/manager.js:13` | 转导 maps/picker.js 的 mountMapPicker，旧下拉框已移除 |
| `maps/README.md` | 其他智能体必读：新增地图步骤、arena 接口、尺寸限制和关联代码 |
| `game.js:10,15–16` | 设置导入、关闭画布重复抗锯齿、载入地图与画质 ID |
| `game.js:27,45` | reset 使用注册出生点；frame 使用注册预览视角及可选 arena.update |
| `game.js:60–73` | refreshQuality / refreshMapLabels 和两类设置回调：切图清场后挂载，重新应用画质 |
| `style.css:35–38` | .map-setting / .quality-setting，选图画质表单和菜单滚动 |
| `settings.test.mjs` | 五档参数应用与设备上限、异常存储回退、重复地图挂载释放 |

旧 tavern.js 保留原位置与原造型，方便对照；后续新地图遵循 maps/README.md，不要在 game.js 内堆积场景代码。

## 选图前端页面

- `maps/picker.js:3–13`：mountMapPicker 创建 #map-open 菜单入口和原生 dialog；独立大图卡片、场地档案、标签及进入地图按钮。
- `maps/picker.js:14–31`：render / 卡片生成，完全读取 MAPS；description、subtitle、tags、thumbnail 为可选元数据，有默认回退。当前仅酒馆；不展示虚构可玩地图。
- `maps/picker.js:32–41`：打开/关闭/键盘隔离/进入；浏览卡片不销毁当前战斗，进入不同地图才调用 game.js 切图回调。同图进入继续当前试炼；点击进入自动保存选择。Esc 与关闭按钮退出页面。
- `maps/registry.js:4`：酒馆前端元数据；`maps/previews/tavern.svg` 为手绘风格场景示意图，并非截图。未来地图提供 thumbnail 路径即可显示预览。
- `style.css:40–44`：.map-open / .arena-dialog / .arena-card / .arena-detail / .arena-bottom，独立选图样式、窄屏单列及固定可见操作栏。
- `maps/README.md` 同步卡片元数据扩展步骤。主游戏不需要为新增地图写 UI 分支。
