# 当前项目问题清单

## 说明

这份清单只记录当前项目里已经能确认的问题和验证缺口，不包含代码修改。

## 高优先级

- [ ] 项目差异化配置还没有真正接入玩法。
  现状：`src/lib/projects.ts` 已经为每个项目配置了 `riskProfile.categoryWeights`、`recommendedStyle`、`milestoneNames`，但事件选择逻辑 `src/lib/game-engine.ts:46-130` 只是在候选池里随机挑事件，没有读取这些权重；顶部阶段文案 `src/components/panels/StatsBar.tsx:42-49` 也仍然是固定值。
  影响：不同项目现在更多是题材换皮，不是机制差异，和这轮玩法改造的目标不一致。

- [ ] `tech_credit` 不会在使用后消耗。
  现状：效果定义里写的是“在 Boss 事件中使用后消耗”，见 `src/lib/effects.ts:60-68`；多个 Boss 选项要求 `requiresEffect: 'tech_credit'`，见 `src/lib/boss-events.ts:65`、`src/lib/boss-events.ts:133`、`src/lib/boss-events.ts:267`；但结果处理逻辑 `src/hooks/useGameTimer.ts:78-86` 只会清除 outcome 自带的 `clearEffect`，没有在玩家实际使用这类选项后消耗 `tech_credit`。
  影响：一旦拿到 `tech_credit`，后续多个 Boss 特殊选项都可能被持续解锁，和设计文案不一致。

## 中优先级

- [ ] `budget_alert` 的清除规则和玩家看到的文案不一致，而且大多数情况下会变成长期 Debuff。
  现状：效果说明写的是“连续 2 次选择低成本选项后解除”，见 `src/lib/effects.ts:28-36`；实际清除条件却是 `apiCost <= 30`，见 `src/lib/game-engine.ts:354-370`。同一文件里的触发条件是 `apiCost > 50`，见 `src/lib/game-engine.ts:323-326`。
  影响：该效果一旦触发，按当前数值逻辑通常无法靠正常游玩自然解除，玩家理解和真实机制会脱节。

- [ ] 紧急事件倒计时会选到锁定选项，绕过“锁定”机制。
  现状：`src/components/prompts/EmergencyAlert.tsx:35-38` 的注释写的是“Auto-select first unlocked choice”，但实际代码直接取的是 `sortedChoices[0]`，没有跳过锁定项。
  影响：像 `boss-demo-day` 里需要 `tech_credit` 的 `live_fix` 这类选项，理论上不该在未解锁时被选中，但倒计时超时后可能直接被系统选上。

## 低优先级

- [ ] 里程碑完成记录没有去重保护。
  现状：`src/hooks/useGameState.ts:256-262` 在推进阶段时直接把 `milestone` push 进 `milestonesCompleted`，没有防重逻辑。
  影响：按当前主流程不一定马上出错，但如果后续里程碑推进逻辑被重复触发，UI 和统计会出现重复完成状态。

## 验证缺口

- [ ] H5 构建结果在当前环境下还不够稳定。
  现状：`pnpm exec tsc --noEmit --skipLibCheck` 可以通过，但 `pnpm run build:h5` 过程中出现了 `system-configuration` 相关的 Rust panic，需要进一步确认是本机环境问题、Taro 依赖问题，还是构建流程本身存在兼容性问题。
  影响：当前还不能把“H5 构建稳定通过”当成已验证结论。

- [ ] 当前工作区还有未提交的文档修改。
  现状：`git status --short` 显示 `docs/PROGRESS.md` 仍有变更。
  影响：后续继续整理文档或提交改动前，最好先确认这份进度文档是不是当前想保留的版本。

