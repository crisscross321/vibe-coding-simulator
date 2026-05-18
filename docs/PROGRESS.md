# Vibe Coding Simulator — 项目进展

## 第一阶段：项目初始化与基础架构 ✅

**完成时间**：2026-05-15

### 1. 初始化 Taro 项目 ✅
- 创建 Taro 4.2.0 项目，框架 React + TypeScript + Sass + Webpack5 + pnpm
- 项目路径：`/Users/crissxu/vibecoding/vibe-coding-simulator`
- 配置 `@/` 路径别名（tsconfig.json + config/index.ts）

### 2. 安装和配置 Tailwind CSS ✅
- 安装 `tailwindcss@3`, `postcss`, `autoprefixer`, `weapp-tailwindcss`
- `tailwind.config.js` — content 指向 `src/**/*.{html,js,ts,jsx,tsx}`，禁用 preflight（小程序兼容）
- `postcss.config.js` — 加入 tailwindcss + autoprefixer 插件
- `config/index.ts` — mini 端集成 `UnifiedWebpackPluginV5`
- `src/app.scss` — 引入 `@tailwind components` + `@tailwind utilities`

### 3. 基础架构 ✅
- TypeScript 类型定义、Reducer + Context、Game 壳组件
- 验证：`pnpm run build:h5` 编译成功，三阶段状态机可切换

---

## 第二阶段：游戏数据、引擎与评分系统 ✅

**完成时间**：2026-05-15

### 核心产出
- 6 个项目配置（含搞笑中文描述）
- 32 个游戏事件（Accept/Reject 二选一格式）
- 游戏引擎（事件选择 + 结果解析 + 活动消息）
- 评分系统（4 维评分 + 等级 + 搞笑称号）
- 主菜单界面（项目卡片网格）

---

## 第三阶段：核心游戏体验 ✅

**完成时间**：2026-05-15

### 核心产出
- 假代码片段（8 组，逐字打字 + 语法高亮）
- 游戏计时器 Hook（事件调度 + 胜负检测）
- 代码动画面板、状态栏、指标卡片、活动日志
- 权限确认弹窗（Accept/Reject）
- CSS 动画（光标闪烁、弹窗缩放、屏幕抖动等）

---

## 第四阶段：结算界面、动画打磨与参数调优 ✅

**完成时间**：2026-05-15

### 核心产出
- 完整结算界面（动态计数 + 等级展示 + 分项进度条）
- CSS 动画补充（渐入、浮动、S级闪光等）
- 参数调优（目标时长 2-3 分钟）
- 主界面增强（初始化延迟、低血量警告、分割线）

---

## 第五阶段：可玩性大改进（多选项 + 策略深度）✅

**完成时间**：2026-05-18

### 背景

完成度没问题，但"不好玩"。核心问题：决策太浅（Accept/Reject 纯赌博）、事件孤立无因果、项目换皮不换玩法、过程像平推无节奏。

### 设计文档
- `docs/PLAYABILITY_NOTES.md` — 外部模型的可玩性分析
- `docs/IMPROVEMENT_PLAN.md` — 整合改进规划（P0/P1/P2 优先级）
- `docs/AGENT_CONTRACT.md` — 多 Agent 接口契约文档

### 改进内容

#### 5.1 新类型系统（Agent 0 / 架构师）
- `src/types/index.ts` — 完全重写
  - 新增：`PlayStyle`（4 种流派）、`DecisionType`（4 种决策界面）、`RiskLevel`
  - 新增：`EventChoice`（多选项）、`MilestoneDefinition`、`ActiveEffect`、`EffectDefinition`
  - 新增：`CausalLink`（因果链）、`ProjectRiskProfile`
  - 改写：`GameEvent`（从 acceptOutcomes/rejectOutcomes → choices[]）
  - 改写：`GameState`（新增 milestone/effects/style/causal 字段）
  - 改写：`GameAction`（14 种 action，移除 ACCEPT/REJECT，新增 MAKE_CHOICE 等）
- `src/lib/constants.ts` — 完全重写
  - 被动进度 0.25 → 0.10（让决策驱动游戏）
  - 弹窗间隔 4-9s → 2.5-5s（节奏加快）
  - 新增：里程碑阈值、流派参数、紧急事件倒计时、成就阈值

#### 5.2 数值配表（Agent 1）
- `src/lib/events.ts` — 重写：22 个通用事件 + 6 个因果链后续事件，全部 3 选项多策略格式
- `src/lib/projects.ts` — 更新：6 个项目加入 `riskProfile`（类别权重 + 推荐流派 + 里程碑名称覆写）
- `src/lib/milestones.ts` — 新建：5 个里程碑定义（init/core/crisis/test/launch）
- `src/lib/effects.ts` — 新建：6 个持续效果（5 debuff + 1 buff）
- `src/lib/causal-chains.ts` — 新建：6 条因果链
- `src/lib/boss-events.ts` — 新建：4 个 Boss 事件（阶段 2-5 各一个，3-4 选项）

#### 5.3 游戏引擎重写（Agent 2）
- `src/hooks/useGameState.ts` — 完全重写：14 种 action 的 reducer
- `src/hooks/useGameTimer.ts` — 完全重写：里程碑检测 + Boss 触发 + 效果 tick + 因果链解锁
- `src/lib/game-engine.ts` — 完全重写：多条件事件选择 + 效果修改器 + 流派加成
- `src/lib/scoring.ts` — 更新：时间惩罚 300→120，新增 dominantStyle + causalChainsTriggered + 流派称号
- `src/context/GameContext.tsx` — 重写：添加 pendingChoiceRef 共享机制

#### 5.4 前端 UI（Agent 3）
- `src/components/prompts/PermissionModal.tsx` — 重写：多选项卡片布局
- `src/components/prompts/EmergencyAlert.tsx` — 新建：红色脉冲 + 8 秒倒计时
- `src/components/prompts/MeetingRoom.tsx` — 新建：NPC 对话气泡式
- `src/components/prompts/ReviewPanel.tsx` — 新建：GitHub diff 风格
- `src/components/panels/MilestoneBar.tsx` — 新建：5 段式进度条
- `src/components/panels/ActiveEffects.tsx` — 新建：效果图标 + tooltip
- `src/components/panels/StatsCards.tsx` — 更新：效果图标指示
- `src/components/screens/PlayingScreen.tsx` — 更新：集成新面板 + decisionType 路由
- `src/components/screens/GameOverScreen.tsx` — 更新：流派展示 + 因果链统计
- `src/components/panels/ActivityLog.tsx` — 更新：适配新 OutcomeLevel
- `src/app.scss` — 追加 7 个 CSS 动画

### 验证结果
- ✅ `tsc --noEmit --skipLibCheck` 零错误
- ✅ `pnpm run build:h5` 编译成功（webpack 5.91.0, 1 warning: entrypoint 318 KiB）

---

## 第六阶段：UI/UX 终端风格改进 ✅

**完成时间**：2026-05-18

### 背景

决策界面全部以弹窗形式呈现，遮挡代码动画区域，与"Vibe Coding"终端编程体验脱节。选项排序混乱、锁定原因不明、结果反馈不醒目。

### 设计文档
- `docs/UX_IMPROVEMENT_PLAN.md` — 5 项改进的完整设计规划

### 改进内容

#### 6.1 普通事件改为终端内联询问（核心改动）
- `src/components/prompts/InlinePrompt.tsx` — **新建**：CLI inline select 风格组件，嵌入代码区底部（非弹窗遮罩）
- `src/components/prompts/PermissionModal.tsx` — **删除**：被 InlinePrompt 替代
- `src/components/prompts/ReviewPanel.tsx` — **删除**：合并到 InlinePrompt
- `src/components/screens/PlayingScreen.tsx` — **重写**：InlinePrompt 嵌入代码区、移除旧弹窗引用
- `decisionType === 'permission'` 和 `'review'` 使用终端内联；`emergency` 和 `meeting` 保留弹窗

#### 6.2 底部虚拟按键条 + 键盘支持
- `src/components/panels/KeypadBar.tsx` — **新建**：三按钮虚拟键盘（↑ / ↓ / ⏎）
- `src/hooks/useKeyboard.ts` — **新建**：H5 端 ArrowUp/ArrowDown/Enter 监听 hook
- 无事件时按键灰显、↑↓ 循环切换自动跳过锁定项、小程序端自动跳过键盘监听

#### 6.3 弹幕式结果反馈
- `src/components/panels/OutcomeDanmaku.tsx` — **新建**：按 OutcomeLevel 不同背景色浮动消息，2s 渐隐
- `src/app.scss` — **追加**：`danmaku-float` + `inline-prompt-enter` 动画
- `src/components/panels/ActivityLog.tsx` — **简化**：移除结果消息，只保留 AI 活动文字

#### 6.4 锁定原因 + 效果信息可查
- `src/lib/choice-utils.ts` — **新建**：`getLockReason()` 返回中文锁定原因文案
- 所有决策组件锁定选项下方显示红色小字说明（"需要「技术信用 ⭐」" / "「预算警报 💸」期间不可选"）
- `src/components/panels/ActiveEffects.tsx` — **增强**：tooltip 增加 `clearHint` 消除条件说明

#### 6.5 选项排序和颜色统一
- `src/lib/choice-utils.ts` — `sortChoicesByRisk()` + `RISK_COLORS` 统一常量
- 排序固定：extreme(紫 #a855f7) → high(红 #ef4444) → medium(黄 #eab308) → low(绿 #22c55e)
- `EmergencyAlert.tsx`、`MeetingRoom.tsx` — **更新**：使用排序 + 锁定原因 + 统一颜色

### 验证结果
- ✅ `tsc --noEmit --skipLibCheck` 零错误

---

## Bug 修复记录

### Fix 1: 页面白屏 — 缺少 index.html 模板
- **修复**：添加 `src/index.html`，包含 `<div id="app">` 挂载点

### Fix 2: H5 页面比例巨大 — rem 缩放 + pxtransform 冲突
- **修复**：移除 rem 缩放脚本 + 禁用 pxtransform

---

## 项目文件结构（当前）

```
vibe-coding-simulator/
├── config/
│   └── index.ts                  # Taro 构建配置
├── docs/
│   ├── PROGRESS.md               # 本文件
│   ├── PROJECT_BRIEF.md          # 项目概况（给 Agent 用）
│   ├── AGENT_CONTRACT.md         # Agent 接口契约
│   ├── IMPROVEMENT_PLAN.md       # 可玩性改进规划
│   ├── UX_IMPROVEMENT_PLAN.md    # UX 终端风格改进规划
│   ├── PLAYABILITY_NOTES.md      # 外部可玩性分析
│   ├── PROGRESS_Agent1.md        # Agent 1 配表工作记录
│   ├── PROGRESS_Agent2.md        # Agent 2 引擎工作记录
│   └── PROGRESS_Agent3.md        # Agent 3 UI 工作记录
├── src/
│   ├── index.html                # H5 HTML 模板
│   ├── app.config.ts             # Taro 应用配置
│   ├── app.tsx                   # 应用入口
│   ├── app.scss                  # 全局样式 + CSS 动画（17+ 动画）
│   ├── types/
│   │   └── index.ts              # 全部游戏类型（多选项/里程碑/效果/流派）
│   ├── lib/
│   │   ├── constants.ts          # 游戏常量（节奏/阈值/流派参数）
│   │   ├── choice-utils.ts       # 选项排序 + 锁定检查 + 锁定原因（新增）
│   │   ├── projects.ts           # 6 个项目（含 riskProfile）
│   │   ├── events.ts             # 28 个通用+因果链事件（3 选项格式）
│   │   ├── boss-events.ts        # 4 个 Boss 事件（3-4 选项）
│   │   ├── milestones.ts         # 5 个里程碑定义
│   │   ├── effects.ts            # 6 个持续效果定义
│   │   ├── causal-chains.ts      # 6 条因果链
│   │   ├── game-engine.ts        # 核心逻辑（事件选择/结果解析/效果/因果链）
│   │   ├── scoring.ts            # 评分（含流派/因果链统计）
│   │   └── code-snippets.ts      # 8 组代码片段
│   ├── hooks/
│   │   ├── useGameState.ts       # Reducer（14 种 action）
│   │   ├── useGameTimer.ts       # 游戏循环（里程碑+Boss+效果+因果链）
│   │   ├── useCodeAnimation.ts   # 代码打字动画 Hook
│   │   └── useKeyboard.ts        # H5 键盘监听 Hook（新增）
│   ├── context/
│   │   └── GameContext.tsx        # Context（pendingChoiceRef 机制）
│   ├── components/
│   │   ├── Game.tsx              # 游戏壳（phase 路由）
│   │   ├── screens/
│   │   │   ├── MainMenu.tsx           # 项目选择
│   │   │   ├── PlayingScreen.tsx      # 游戏主界面（内联询问+虚拟键盘+弹幕）
│   │   │   └── GameOverScreen.tsx     # 结算（含流派+因果链）
│   │   ├── panels/
│   │   │   ├── CodeAnimation.tsx      # 代码编辑器
│   │   │   ├── StatsBar.tsx           # 顶部状态栏
│   │   │   ├── StatsCards.tsx         # 指标卡片（含效果标记）
│   │   │   ├── ActivityLog.tsx        # 活动日志（纯 AI 活动文字）
│   │   │   ├── MilestoneBar.tsx       # 里程碑进度条
│   │   │   ├── ActiveEffects.tsx      # 持续效果图标条（含 clearHint）
│   │   │   ├── KeypadBar.tsx          # 底部虚拟按键条（新增）
│   │   │   └── OutcomeDanmaku.tsx     # 弹幕式结果反馈（新增）
│   │   └── prompts/
│   │       ├── InlinePrompt.tsx       # 终端内联选项（新增，替代旧弹窗）
│   │       ├── EmergencyAlert.tsx     # 限时红色警报
│   │       └── MeetingRoom.tsx        # NPC 对话式
│   └── pages/
│       └── index/
│           ├── index.tsx
│           ├── index.config.ts
│           └── index.scss
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── babel.config.js
└── package.json
```
