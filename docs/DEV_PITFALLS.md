# 开发要点与踩坑备忘

## 配表 ↔ 逻辑必须双向验证

| 坑 | 教训 |
|----|------|
| 配了 `categoryWeights` / `milestoneNames` 但引擎不读 | 新增配置字段后，必须 grep 确认至少有一处运行时代码引用它 |
| `clearHint` 文案写"连续2次低成本解除"，代码却是 `apiCost <= 30` | 效果的触发/清除条件必须和玩家可见文案对齐，改一端要同步另一端 |
| Boss 选项标注 `requiresEffect` 但无消耗逻辑 | 设计"使用即消耗"的效果时，在 outcome 处理流程中显式 dispatch `CLEAR_EFFECT` |

## Taro / 小程序限制

- 组件只用 `View` / `Text` / `ScrollView`，不写 `div` / `span`
- JSX 只能用三元和 `.map()`，不能在 map 里 if/else
- Tailwind class 不能含 `/`（如 `w-1/2` 要用 `w-[50%]` 代替）
- CSS 动画统一放 `src/app.scss`，不要用 Framer Motion

## 状态机 & Reducer 注意

- Reducer 里的数组操作要考虑幂等性（例如 `milestonesCompleted` 需去重守卫）
- `pendingChoiceRef` 是异步桥梁：UI dispatch → ref 暂存 → timer 下一帧读取并处理；不要试图在 reducer 里直接算 outcome
- 新增 action 后同步更新 `src/types/index.ts` 的 `GameAction` union type

## 效果系统生命周期清单

每新增一个 Effect，确认以下五点全部实现：

1. `effects.ts` — 定义（含 `clearHint`）
2. `game-engine.ts:checkEffectTriggers` — 触发条件
3. `game-engine.ts:checkEffectClears` — 清除条件（须和 `clearHint` 一致）
4. `choice-utils.ts:isChoiceLocked` — 是否影响选项可用性
5. UI 组件（EmergencyAlert 等）— 超时/自动选择要跳过锁定项

## UI 决策组件路由规则

| decisionType | Boss? | 渲染方式 |
|---|---|---|
| `permission` / `review` | 否 | 终端内联 `InlinePrompt` |
| `emergency` | — | 弹窗 `EmergencyAlert` |
| `meeting` | — | 弹窗 `MeetingRoom` |
| 任意 | 是 | 弹窗 `MeetingRoom` |

## 流程规范

- **每次功能/修复完成后** → 更新 `docs/PROGRESS.md`（新增阶段章节）
- 提交前跑 `pnpm exec tsc --noEmit --skipLibCheck` 确认零错误
- 不要 `git add -A`；secrets / `.env.local` 永远不提交
- Commit message 用 Conventional Commits 格式（见 `.claude/rules/git-workflow.md`）
