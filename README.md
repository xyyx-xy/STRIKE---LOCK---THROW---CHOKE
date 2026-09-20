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

导航核对日期：2026-09-20（v0.4.2）。新增代码请采用可读的分行格式。

## 运行环境与操作

- 原生 ES modules、Three.js / WebGL、HTML / CSS；运行依赖在 `vendor/three.module.js`，无构建步骤、无需联网。`package.json` 声明 ES module。
- 使用支持 WebGL 的桌面浏览器；本地服务需要 Python 3，自动化检查需要 Node.js。
- 双击 `启动试玩.command`：复制源码到预览缓存，启动本机 `http://127.0.0.1:8878/`。源码更新后重新运行启动器。
- 也可在本目录运行 `python3 serve.py --port 8879` 直接预览源码。不要依赖 `file://` 下 ES module 的浏览器行为。
- WASD 走位、Shift 快步、鼠标环视；方向键也可转向。默认左键交替掌击，右键交替正蹬；可在暂停页的「按键单招」独立修改鼠标左右键、Q、E。
- 默认按住 Q 护头、E 护躯干；匹配高度的正面攻击可格挡。P / ESC 暂停；锁定鼠标失败时使用直接环视。
- 可选固定左右直拳（拳峰）、左右掌击、左右正蹬和两种防守；按键另保留交替掌击/正蹬/直拳选项。攻击每次按下触发一次（长按不连发），防守按住维持。手动单招中断连招，暂停/失焦清除按住状态。
- 暂停页编排八种单招，三套招式分别按 1 / 2 / 3 施放，X 取消剩余动作；每套最多 12 步，防守 0.2–3 秒。保存仅属于当前浏览器、当前地址。
- 清空一回合后间隔 4 秒进入下一回合；从 3 人逐步增加至最多 9 人。生命耗尽后可再战。

## 代码执行顺序与数据

`index.html` → `game.js` 初始化场景、玩家和编辑器 → `frame()` 渲染循环 → 固定 1/60 秒 `simulate()` → `combat.tick()` 战斗与伤势 → `effects()` 处理事件 → 更新骨架、第一人称和 HUD。

- 玩家状态 `s` 包含生命、攻击、波次、对手、击倒计数；位置/视角在 `p`。NPC 的 `e.hp` 是存活标记，具体部位生命在 `e.body`，独立血量在 `e.blood`。
- 姿态是关节点字典，例如 `Lshoulder / Lelbow / Lwrist`（左肩/肘/腕）、`Lhip / Lknee / Lankle`（左髋/膝/踝）。R 为右侧；局部坐标 Y 向上、−Z 向前。
- `enemyPose()` 生成的同一套关节点供显示和 `enemyParts()` 命中检测使用。改肢体位置时必须核对碰撞，不能只改显示。
- 玩家暂用总生命；NPC 才有分部位受伤、失血、断肢。关节技、主动摔投、绞技、武器及完整游戏存档尚未实现。自定义招式已有本地存储。

## 环境、酒馆与渲染在哪里

| 文件与行号 | 入口/部分 | 负责内容 |
|---|---|---|
| `tavern.js:3–7` | `createTavern`、`mat`、`box` | 场景背景、雾、主光、材质缓存、方块构建工具 |
| `tavern.js:8–10` | 地板、墙、木装饰 | 24 × 22 酒馆主体，沿用《最后一杯》环境，后墙无牌匾 |
| `tavern.js:11–12` | 吧台、瓶架、酒瓶 | 后方吧台陈设 |
| `tavern.js:13–15` | `obstacles`、`chair`、桌椅循环 | 家具模型、布局和障碍物注册 |
| `tavern.js:16–17` | 吊灯、窗户 | 吊灯模型与点光源、侧墙窗 |
| `tavern.js:18–22` | `inside / resolve / clear / steer` | 家具碰撞修正、近战遮挡、NPC 绕行、场地边界 |
| `game.js:14–16` | `renderer / camera / arena / handsScene` | 渲染器、主摄像机、酒馆入口、独立第一人称手脚场景 |
| `game.js:40` | `frame / resize` | 主场景和手脚的分层渲染、视角、震动、窗口尺寸 |
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
| `game.js:16–18` | `playerRig` 初始化 | 第一人称模型的摄像机挂载和位置 |
| `game.js:36` | NPC 骨架更新 | 世界坐标、朝向、步速、手型、防守、断肢显示、受击反馈 |
| `game.js:39` | `handPose`、`ka` 正蹬分支 | 第一人称手臂偏移、玩家踢腿关键帧；与 `rig.js:8` 的第三人称正蹬分别维护 |
| `viewmodel.js:2–8` | `updateViewVisibility` | 第一人称只显示小臂和手；踢腿时显示对应整条腿直到收招 |
| `injury.js:2–5` | `PARTS / initBody / isGone / bleedRate` | 部位血量、伤害倍率、断肢状态及出血速率 |
| `injury.js:6` | `mobility` | 伤势决定站立/跛行/缓行/三种爬行动作及速度 |
| `injury.js:7–9` | `damagePart / tickInjury` | 扣部位血、概率击晕、断肢、头/躯干致命、持续失血致死 |

## 战斗、输入、招式与反馈在哪里

| 文件与行号 | 入口/部分 | 负责内容 |
|---|---|---|
| `combat.js:4–7` | `ATTACKS / createState / beginAttack / targetInReach` | 攻击伤害、距离、时长、连击收招限制、初始状态；新增 punch：伤害 38、命中 0.14s、总时长 0.42s、距离 1.95 |
| `combat.js:8–14` | `enemyParts / strikeHit` | 随姿态更新的身体碰撞体、最先接触部位；实体手臂可替头承伤 |
| `combat.js:15–19` | `down / tick` 前半 | 伤势计时、死亡计数、刷波次、玩家攻击结算与受击事件 |
| `combat.js:20–24` | `tick` 后半 | NPC 防守/攻击 AI、攻击高度、玩家格挡、追击、拥挤分离、场地碰撞 |
| `movement.js:3` | `movePlayer` | 玩家移动加速、减速、冲刺和方向换算 |
| `game.js:22–33` | 状态、`notify / reset / pause`、输入监听 | 暂停、重开、鼠标锁定、键盘和鼠标绑定；扣血提示由 `notify` 写入 |
| `game.js:34` | `effects` | `hit / hurt / block / sever / bleed / down / wave` 事件映射到文字、血液、音效、停顿和震屏 |
| `game.js:35–39` | `simulate` | 每个模拟步处理手动防守、连招、移动、战斗和模型姿态 |
| `game.js:40–43` | `frame / updateTarget`、部位行初始化 | 玩家生命、波次、击倒计数、瞄准部位、目标血条和失血数值 |
| `combos.js:1–5` | `MOVES / validateCombo / newPlayback / stepPlayback / loadCombos` | 八种单招目录、输入校验、按收招时序播放、读取三套招式 |
| `combo-editor.js:2–8` | `mountComboEditor`、`render`、各按钮监听 | 暂停页增删排序、命名、时长、栏位切换、保存；存储键 `da-ji-tou-jiao.combos.v1` |
| `fx.js:4–30` | `splatTexture / Blood.constructor` 及内部方法 | 程序血迹贴图、血雾点、碎块实例、地面/墙面贴花池 |
| `fx.js:31–48` | `burst / explode / drip / reset` | 普通命中、爆散、滴血、重开清理 |
| `fx.js:49–62` | `Blood.step` | 粒子生命周期、重力、弹跳及 GPU 数据更新 |
| `audio.js:2–16` | `FightAudio`、`unlock / play` | Web Audio 合成挥击、命中、倒地、受伤及回合音效 |

## 直拳与按键设置入口

| 文件与行号 | 入口/部分 | 负责内容 |
|---|---|---|
| `punch.js:4` | `buildFist` | 独立握拳模型：整体掌体、无分指的平整拳面、简化外扣拇指（参考图块状轮廓）；局部 −Z 是打击方向 |
| `punch.js:24` | `punchPose` | 直拳肘腕关键帧、肩部前送，0.14 秒到达最大伸展后收招 |
| `punch.js:38` | `showFists` | 第一人称拳模/原有张掌切换、拳峰与小臂对齐；绑定直拳后待机握拳，防守恢复张掌 |
| `bindings.js:13` | `validateBindings` | 四键动作白名单与默认配置回退 |
| `bindings.js:17` | `loadBindings` | 独立存储键 da-ji-tou-jiao.bindings.v1，旧连招不变 |
| `bindings.js:21` | `heldGuard` | 按下次序决定同时按住的防守优先级，松开后恢复其他仍按住的防守 |
| `bindings.js:25` | `pressBinding` | 鼠标/Q/E 共用攻击入口，固定左右侧、交替、格挡互斥与失败回滚 |
| `bindings.js:36` | `defenseHint` | 高/中段提示跟随真实按键，不再写死 Q/E |
| `binding-editor.js:3` | `mountBindingEditor` | 在暂停招式页插入四个选择器、保存与填入默认按键，变更保存后生效 |
| `game.js:45` | `useBinding` | 中断连招并调用映射后的单招及音效 |
| `game.js:49` | `updateBindingLabels` | 同步鼠标左右键、Q、E 的底部 HUD 文本 |
| `bindings.js:4–13` | `CONTROLS / BINDING_MOVES / DEFAULT_BINDINGS / BINDINGS_KEY` | 四个可改按键、八个单招及三种交替选项、默认映射和存储键 |

直拳沿用原有瞄准方向的扫掠命中判定（`combat.strikeHit`），拳峰模型和动作独立；未加入逐网格刚体碰撞。`game.js:1–3` 导入新模块，`game.js:22` 挂载按键设置；`index.html:1` 的 `#hint-Mouse0 / #hint-Mouse2 / #hint-KeyQ / #hint-KeyE` 是动态按键提示。

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
| `AGENTS.md:1–6` | 智能体协作入口，要求先读 README 并同步维护代码地图 |
| `v*.更新.md` | 各版本变更记录，不承担代码导航职责 |

运行规则/动画检查：

```sh
node --test *.test.mjs
```

纯 HUD 位置修改用浏览器验证：扣血提示在左侧生命条下面，长文换行，不与中央回合、人数重叠；同时检查窄屏。改肢体/战斗后运行对应检查并实际查看动作。更新导航可用 `nl -ba 文件名` 查看行号，或 `rg -n '函数名|选择器' 文件名` 精确定位。
