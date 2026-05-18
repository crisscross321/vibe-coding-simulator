# 项目简介：Vibe Coding Simulator（氛围编程模拟器）

## 概述

一款讽刺性小游戏，模拟 "Vibe Coding" 体验。玩家选择项目后，AI 自动"编程"（前端假装写代码），每隔几秒弹出决策弹窗，玩家从 3 个策略选项中选择，根据概率产生不同结果。进度到 100% 交付成功，系统健康度归 0 则崩溃。

## 技术栈

- **Taro 4**（React + TypeScript），可编译为 H5 网页 和 微信小程序
- **Tailwind CSS 3** + `weapp-tailwindcss`（兼容小程序）
- **CSS 动画**（不用 Framer Motion，保证跨端兼容）
- **useReducer + React Context** 管理状态（含 pendingChoiceRef 共享机制）
- 纯前端，无后端/数据库
- 包管理器：pnpm

## 项目路径

`/Users/crissxu/vibecoding/vibe-coding-simulator`

## 目录结构

```
src/
├── app.tsx / app.config.ts / app.scss   # Taro 入口 + 全局样式 + CSS 动画(14+)
├── pages/index/                          # 唯一页面入口
├── components/
│   ├── Game.tsx                          # 状态机壳：menu → playing → gameover
│   ├── screens/
│   │   ├── MainMenu.tsx                  # 项目选择界面（6 个项目卡片）
│   │   ├── PlayingScreen.tsx             # 游戏主界面（集成所有面板 + 决策类型路由）
│   │   └── GameOverScreen.tsx            # 结算界面（含流派展示 + 因果链统计）
│   ├── panels/
│   │   ├── CodeAnimation.tsx             # 代码逐字打字效果 + 语法高亮
│   │   ├── StatsBar.tsx                  # 顶部状态栏（项目名、进度条、计时器）
│   │   ├── StatsCards.tsx                # 4 个指标卡片（质量/Bug/费用/健康度）+ 效果标记
│   │   ├── ActivityLog.tsx               # AI 活动日志 + 结果消息
│   │   ├── MilestoneBar.tsx              # 5 段式里程碑进度条
│   │   └── ActiveEffects.tsx             # 当前持续效果图标条
│   └── prompts/
│       ├── PermissionModal.tsx           # 多选项卡片式决策（通用，decisionType='permission'）
│       ├── EmergencyAlert.tsx            # 限时红色警报（decisionType='emergency'）
│       ├── MeetingRoom.tsx               # NPC 对话式决策（decisionType='meeting'）
│       └── ReviewPanel.tsx               # 代码评审式决策（decisionType='review'）
├── lib/
│   ├── game-engine.ts                    # 核心逻辑：selectEvent, resolveOutcome, 效果检查, 因果链
│   ├── events.ts                         # 28 个游戏事件（22 通用 + 6 因果链后续），3 选项格式
│   ├── boss-events.ts                    # 4 个 Boss 事件（阶段 2-5 各一个，3-4 选项）
│   ├── milestones.ts                     # 5 个里程碑阶段定义
│   ├── effects.ts                        # 6 个持续效果定义（5 debuff + 1 buff）
│   ├── causal-chains.ts                  # 6 条因果链定义
│   ├── projects.ts                       # 6 个可选项目配置（含 riskProfile）
│   ├── code-snippets.ts                  # 假代码片段（8 组，按进度切换）
│   ├── scoring.ts                        # 评分算法 + 等级 + 流派称号
│   └── constants.ts                      # 游戏参数（节奏/阈值/流派/效果）
├── hooks/
│   ├── useGameState.ts                   # useReducer：14 种 Action 处理
│   ├── useGameTimer.ts                   # 游戏循环：里程碑检测/Boss 触发/效果 tick/因果链
│   └── useCodeAnimation.ts              # 代码打字效果 Hook
├── context/
│   └── GameContext.tsx                   # React Context（pendingChoiceRef 共享机制）
└── types/
    └── index.ts                          # 全部 TS 类型（多选项/里程碑/效果/流派/因果链）
```

## 核心机制

### 五大指标
- **Progress** (0→100)：进度，到 100 即胜利
- **Code Quality** (70→?)：代码质量
- **Bugs** (0→?)：Bug 数
- **API Cost** ($0→?)：AI 花费
- **System Health** (100→0?)：系统健康度，到 0 即崩溃

### 多选项决策系统
- 每个事件提供 **3 个选项**（少数 Boss 事件 4 个）
- 每个选项代表不同策略流派：speed / craft / budget / gambler
- 不存在"明显最优解"，每个选项在不同维度有 trade-off
- 选项附带风险等级指示（low/medium/high/extreme）

### 里程碑系统
- 5 个阶段：init(0-20%) → core(20-45%) → crisis(45-65%) → test(65-85%) → launch(85-100%)
- 每个阶段转换触发一个 Boss 事件（必须面对，不可跳过）

### 持续效果系统
- 6 种效果：tech_debt / fragile_arch / budget_alert / overconfidence / low_morale / tech_credit
- 坏决策不只扣分，还施加持续状态影响后续事件概率和可选选项
- 效果可叠加（最大 3 层），有明确消除条件

### 因果链系统
- 6 条因果链：前面的危险选择会在 1-2 个事件后触发特定后续事件
- 让玩家感受到"之前的选择导致了这个后果"

### 流派系统
- 连续 3 次选同流派选项后确认流派，获得该流派的正面结果加成 +8%
- 结算时展示"本局玩法风格"

### 决策界面多样化
- `permission`：标准多选项卡片（通用事件）
- `emergency`：红色全屏 + 8 秒倒计时（因果链后续事件）
- `meeting`：NPC 对话气泡式（Boss 事件）
- `review`：代码 diff 视图（技术评审事件）

### 节奏参数
- **被动进度**：0.10%/秒（靠选择推进为主）
- **弹窗间隔**：2.5-5 秒
- **目标总时长**：60-90 秒/局
- **决策轮数**：~10 轮普通 + 4 轮 Boss = 14 次选择

### 评分系统
- 4 维评分：完成度(400) + 质量(250) + 效率(200) + 稳定性(150) = 满分 1000
- 等级：S(≥900) A(≥750) B(≥600) C(≥400) D(≥200) F(<200)
- 搞笑称号（含流派相关称号）

## Taro 开发注意事项

- 使用 Taro 组件：`View` / `Text` / `ScrollView`（不用 div/span）
- JSX 限制：只用三元和 `map`，不在 map 内用 if/else
- Tailwind 类名避免 `/` 字符（小程序不支持）
- 事件绑定用 `onClick`
- CSS 动画定义在 `src/app.scss`

## 运行命令

```bash
cd /Users/crissxu/vibecoding/vibe-coding-simulator
pnpm run dev:h5        # H5 网页开发服务器
pnpm run dev:weapp     # 微信小程序开发
pnpm run build:h5      # 生产构建
```

## 当前状态

五阶段开发全部完成。游戏可完整运行（主菜单 → 游戏 → 结算 → 再来一局）。
`tsc --noEmit` 零错误，`build:h5` 编译成功。

## 相关文档

| 文档 | 用途 |
|------|------|
| `docs/PROGRESS.md` | 完整开发进展记录 |
| `docs/IMPROVEMENT_PLAN.md` | 可玩性改进规划（P0/P1/P2） |
| `docs/AGENT_CONTRACT.md` | 多 Agent 分工接口契约 |
| `docs/PLAYABILITY_NOTES.md` | 外部可玩性分析 |
| `docs/PROGRESS_Agent1.md` | Agent 1（配表）工作记录 |
| `docs/PROGRESS_Agent2.md` | Agent 2（引擎）工作记录 |
| `docs/PROGRESS_Agent3.md` | Agent 3（UI）工作记录 |
