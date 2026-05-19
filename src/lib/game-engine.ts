import { GAME_CONSTANTS } from '@/lib/constants'
import { GAME_EVENTS } from '@/lib/events'
import { BOSS_EVENTS } from '@/lib/boss-events'
import { EFFECT_DEFINITIONS } from '@/lib/effects'
import { CAUSAL_LINKS } from '@/lib/causal-chains'
import type {
  GameEvent,
  GameState,
  WeightedOutcome,
  ActiveEffect,
  EventResult,
  EventCategory,
  EffectId,
  ProjectConfig,
  PlayStyle,
} from '@/types'

// ============================================================
// 工具函数
// ============================================================

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/** 按事件 category 对应权重做加权随机选择 */
function pickWeightedRandom(
  candidates: GameEvent[],
  categoryWeights: Partial<Record<EventCategory, number>>
): GameEvent {
  const weighted = candidates.map(event => ({
    event,
    weight: categoryWeights[event.category] ?? 1.0,
  }))

  const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0)
  let roll = Math.random() * totalWeight

  for (const { event, weight } of weighted) {
    roll -= weight
    if (roll <= 0) return event
  }

  return weighted[weighted.length - 1].event
}

// ============================================================
// 事件选择
// ============================================================

/**
 * 选择下一个游戏事件
 *
 * 优先级：
 * 1. 因果链解锁的事件（满足 minDelay）
 * 2. 需要特定效果的事件（当前拥有该效果）
 * 3. 项目专属事件
 * 4. 通用事件池
 *
 * 过滤条件：
 * - 进度范围匹配
 * - 不在最近 3 个事件中（避免重复）
 * - 前置事件已完成
 * - 必需效果存在
 * - 项目匹配
 */
export function selectEvent(
  progress: number,
  recentEventIds: string[],
  activeEffects: ActiveEffect[],
  unlockedCausalEvents: string[],
  projectId: string,
  eventsCompleted: number,
  eventHistory: EventResult[],
  categoryWeights?: Partial<Record<EventCategory, number>>
): GameEvent {
  const recentSet = new Set(recentEventIds.slice(-3))
  const completedEventIds = new Set(eventHistory.map(e => e.eventId))
  const activeEffectIds = new Set(activeEffects.map(e => e.id))

  // 所有可用事件池（通用 + Boss）
  const allEvents = [...GAME_EVENTS, ...BOSS_EVENTS]

  // 基础过滤：进度范围 + 非最近重复 + 非 Boss（Boss 由里程碑系统单独触发）
  const baseFilter = (event: GameEvent): boolean => {
    if (event.isBoss) return false
    if (progress < event.minProgress || progress > event.maxProgress) return false
    if (recentSet.has(event.id)) return false

    // 前置事件检查
    if (event.prerequisites && event.prerequisites.length > 0) {
      const allMet = event.prerequisites.every(preId => completedEventIds.has(preId))
      if (!allMet) return false
    }

    // 必需效果检查
    if (event.requiredEffects && event.requiredEffects.length > 0) {
      const allEffects = event.requiredEffects.every(eid => activeEffectIds.has(eid))
      if (!allEffects) return false
    }

    // 项目专属检查
    if (event.projectIds && event.projectIds.length > 0) {
      if (!event.projectIds.includes(projectId)) return false
    }

    return true
  }

  const candidates = allEvents.filter(baseFilter)

  // 优先级 1：因果链解锁的事件
  if (unlockedCausalEvents.length > 0) {
    const causalCandidates = candidates.filter(e => {
      if (!unlockedCausalEvents.includes(e.id)) return false

      // 检查 minDelay：从触发时刻起，至少经过 N 个事件
      const link = CAUSAL_LINKS.find(l => l.targetEventId === e.id)
      if (link) {
        // 找到触发该因果链的源事件在 eventHistory 中的位置
        const sourceIndex = eventHistory.findIndex(
          h => h.eventId === link.sourceEventId && h.choiceId === link.sourceChoiceId
        )
        if (sourceIndex >= 0) {
          const eventsSinceTrigger = eventsCompleted - (sourceIndex + 1)
          if (eventsSinceTrigger < link.minDelay) return false
        }
      }
      return true
    })

    if (causalCandidates.length > 0) {
      // 因果链事件有 50% 概率被优先选中
      if (Math.random() < 0.5) {
        return pickRandom(causalCandidates)
      }
    }
  }

  // 普通候选池
  if (candidates.length > 0) {
    return categoryWeights
      ? pickWeightedRandom(candidates, categoryWeights)
      : pickRandom(candidates)
  }

  // 兜底：放宽条件到只看进度范围
  const fallbackCandidates = allEvents.filter(
    e => !e.isBoss && progress >= e.minProgress && progress <= e.maxProgress
  )

  if (fallbackCandidates.length > 0) {
    return categoryWeights
      ? pickWeightedRandom(fallbackCandidates, categoryWeights)
      : pickRandom(fallbackCandidates)
  }

  // 最终兜底：任何非 Boss 事件
  const nonBossEvents = allEvents.filter(e => !e.isBoss)
  return pickRandom(nonBossEvents.length > 0 ? nonBossEvents : allEvents)
}

// ============================================================
// 获取 Boss 事件
// ============================================================

/**
 * 根据 bossEventId 获取 Boss 事件
 */
export function getBossEvent(bossEventId: string): GameEvent | null {
  return BOSS_EVENTS.find(e => e.id === bossEventId) ?? null
}

// ============================================================
// 结果解析
// ============================================================

/**
 * 根据加权结果列表，应用效果修改器调整权重后随机选择一个结果
 *
 * 修改器逻辑：
 * - catastropheBonus[category]: 灾难权重 × (1 + bonus/100)
 * - successBonus: 成功权重 × (1 + bonus/100)
 * - 流派确认加成：confirmedStyle 匹配时，正面结果权重 +STYLE_CONFIRM_BONUS%
 */
export function resolveOutcome(
  outcomes: WeightedOutcome[],
  activeEffects: ActiveEffect[],
  eventCategory: EventCategory,
  confirmedStyle?: PlayStyle | null,
  choiceStyle?: PlayStyle
): WeightedOutcome {
  // 计算总效果修改器
  let totalCatastropheBonus = 0
  let totalSuccessBonus = 0

  for (const effect of activeEffects) {
    const definition = EFFECT_DEFINITIONS.find(d => d.id === effect.id)
    if (!definition) continue

    const modifiers = definition.modifiers

    // 灾难概率加成（按叠层数叠加）
    if (modifiers.catastropheBonus && modifiers.catastropheBonus[eventCategory]) {
      totalCatastropheBonus += (modifiers.catastropheBonus[eventCategory] ?? 0) * effect.stacks
    }

    // 成功概率加成
    if (modifiers.successBonus) {
      totalSuccessBonus += modifiers.successBonus * effect.stacks
    }
  }

  // 流派确认加成
  if (confirmedStyle && choiceStyle && confirmedStyle === choiceStyle) {
    totalSuccessBonus += GAME_CONSTANTS.STYLE_CONFIRM_BONUS
  }

  // 调整权重
  const adjustedOutcomes = outcomes.map(outcome => {
    let adjustedWeight = outcome.weight

    if (outcome.level === 'catastrophe' && totalCatastropheBonus !== 0) {
      adjustedWeight = adjustedWeight * (1 + totalCatastropheBonus / 100)
    }

    if ((outcome.level === 'success' || outcome.level === 'quality_boost') && totalSuccessBonus !== 0) {
      adjustedWeight = adjustedWeight * (1 + totalSuccessBonus / 100)
    }

    // 确保权重不会变为负数
    return { ...outcome, weight: Math.max(0.01, adjustedWeight) }
  })

  // 加权随机选择
  const totalWeight = adjustedOutcomes.reduce((sum, o) => sum + o.weight, 0)
  let roll = Math.random() * totalWeight

  for (const outcome of adjustedOutcomes) {
    roll -= outcome.weight
    if (roll <= 0) {
      return outcome
    }
  }

  // 兜底
  return adjustedOutcomes[adjustedOutcomes.length - 1]
}

// ============================================================
// 弹窗间隔
// ============================================================

/**
 * 计算下一次弹窗的延迟（毫秒）
 */
export function getNextPromptDelay(): number {
  const { MIN_PROMPT_DELAY, MAX_PROMPT_DELAY } = GAME_CONSTANTS
  return MIN_PROMPT_DELAY + Math.random() * (MAX_PROMPT_DELAY - MIN_PROMPT_DELAY)
}

// ============================================================
// 活动消息
// ============================================================

const ACTIVITIES_INIT = [
  'Setting up project structure...',
  'Configuring dependencies...',
  'Initializing Git repository...',
  'Generating boilerplate code...',
  'Setting up linter and formatter...',
  'Creating directory scaffold...',
  'Writing initial config files...',
]

const ACTIVITIES_CORE = [
  'Building authentication module...',
  'Implementing core logic...',
  'Writing data models...',
  'Setting up API routes...',
  'Creating service layer...',
  'Implementing state management...',
  'Building component library...',
]

const ACTIVITIES_ENHANCE = [
  'Adding API integrations...',
  'Optimizing database queries...',
  'Implementing caching layer...',
  'Building search functionality...',
  'Adding real-time features...',
  'Writing middleware...',
  'Implementing file uploads...',
]

const ACTIVITIES_TEST = [
  'Running test suites...',
  'Fixing edge cases...',
  'Writing integration tests...',
  'Debugging flaky tests...',
  'Load testing the API...',
  'Fixing memory leaks...',
  'Profiling performance bottlenecks...',
]

const ACTIVITIES_FINISH = [
  'Final optimizations...',
  'Preparing for deployment...',
  'Writing documentation...',
  'Minifying production bundle...',
  'Running security audit...',
  'Cleaning up unused code...',
  'Setting up monitoring...',
]

/**
 * 根据当前进度和项目生成 AI 活动描述
 */
export function getActivityMessage(progress: number, _project: ProjectConfig): string {
  const { MILESTONE_THRESHOLDS } = GAME_CONSTANTS

  if (progress < MILESTONE_THRESHOLDS.init[1]) return pickRandom(ACTIVITIES_INIT)
  if (progress < MILESTONE_THRESHOLDS.core[1]) return pickRandom(ACTIVITIES_CORE)
  if (progress < MILESTONE_THRESHOLDS.crisis[1]) return pickRandom(ACTIVITIES_ENHANCE)
  if (progress < MILESTONE_THRESHOLDS.test[1]) return pickRandom(ACTIVITIES_TEST)
  return pickRandom(ACTIVITIES_FINISH)
}

// ============================================================
// 效果触发/消除检查
// ============================================================

/**
 * 检查是否应触发新的持续效果
 * 基于游戏状态的阈值检测
 */
export function checkEffectTriggers(state: GameState): EffectId | null {
  const activeIds = new Set(state.activeEffects.map(e => e.id))

  // 技术债：代码质量低于 40 且无此效果
  if (state.codeQuality < 40 && !activeIds.has('tech_debt')) {
    return 'tech_debt'
  }

  // 脆弱架构：bug 数超过 8 且无此效果
  if (state.bugs > 8 && !activeIds.has('fragile_arch')) {
    return 'fragile_arch'
  }

  // 预算警报：API 成本超过 50 且无此效果
  if (state.apiCost > 50 && !activeIds.has('budget_alert')) {
    return 'budget_alert'
  }

  // 过度自信：连续 3 次成功且无此效果
  if (state.eventHistory.length >= 3 && !activeIds.has('overconfidence')) {
    const lastThree = state.eventHistory.slice(-3)
    const allSuccess = lastThree.every(
      e => e.outcome.level === 'success' || e.outcome.level === 'quality_boost'
    )
    if (allSuccess) return 'overconfidence'
  }

  // 士气低落：连续 2 次灾难且无此效果
  if (state.eventHistory.length >= 2 && !activeIds.has('low_morale')) {
    const lastTwo = state.eventHistory.slice(-2)
    const allBad = lastTwo.every(
      e => e.outcome.level === 'catastrophe' || e.outcome.level === 'moderate'
    )
    if (allBad) return 'low_morale'
  }

  return null
}

/**
 * 检查哪些效果应该被消除
 * 返回应清除的效果 ID 列表
 */
export function checkEffectClears(state: GameState): EffectId[] {
  const toClear: EffectId[] = []
  const activeIds = new Set(state.activeEffects.map(e => e.id))

  // 技术债：代码质量恢复到 60 以上
  if (activeIds.has('tech_debt') && state.codeQuality >= 60) {
    toClear.push('tech_debt')
  }

  // 脆弱架构：bug 数降到 3 以下
  if (activeIds.has('fragile_arch') && state.bugs <= 3) {
    toClear.push('fragile_arch')
  }

  // 预算警报：连续 2 次选择非高成本选项后解除
  if (activeIds.has('budget_alert') && state.eventHistory.length >= 2) {
    const lastTwo = state.eventHistory.slice(-2)
    const allEventsPool = [...GAME_EVENTS, ...BOSS_EVENTS]
    const bothLowCost = lastTwo.every(record => {
      const eventDef = allEventsPool.find(e => e.id === record.eventId)
      if (!eventDef) return false
      const choiceDef = eventDef.choices.find(c => c.id === record.choiceId)
      if (!choiceDef) return false
      return !choiceDef.isHighCost
    })
    if (bothLowCost) {
      toClear.push('budget_alert')
    }
  }

  // 过度自信：经历一次灾难后清除
  if (activeIds.has('overconfidence') && state.eventHistory.length > 0) {
    const lastEvent = state.eventHistory[state.eventHistory.length - 1]
    if (lastEvent.outcome.level === 'catastrophe') {
      toClear.push('overconfidence')
    }
  }

  // 士气低落：连续 2 次成功后恢复
  if (activeIds.has('low_morale') && state.eventHistory.length >= 2) {
    const lastTwo = state.eventHistory.slice(-2)
    const allGood = lastTwo.every(
      e => e.outcome.level === 'success' || e.outcome.level === 'quality_boost'
    )
    if (allGood) toClear.push('low_morale')
  }

  // 技术信用：被使用后（选了 requiresEffect 为 tech_credit 的选项后自动清除）
  // 这个由 CLEAR_EFFECT action 在 useGameTimer 中手动触发

  return toClear
}

// ============================================================
// 因果链检查
// ============================================================

/**
 * 检查当前选择是否触发因果链
 * 返回应该解锁的 targetEventId 列表
 */
export function checkCausalLinks(
  eventId: string,
  choiceId: string,
  outcomeLevel: string,
  alreadyUnlocked: string[]
): string[] {
  const unlockedSet = new Set(alreadyUnlocked)
  const newUnlocks: string[] = []

  for (const link of CAUSAL_LINKS) {
    // 已经解锁的跳过
    if (unlockedSet.has(link.targetEventId)) continue

    // 匹配源事件和选项
    if (link.sourceEventId !== eventId) continue
    if (link.sourceChoiceId !== choiceId) continue

    // 如果有结果等级过滤
    if (link.sourceOutcomeLevel && link.sourceOutcomeLevel !== outcomeLevel) continue

    newUnlocks.push(link.targetEventId)
  }

  return newUnlocks
}
