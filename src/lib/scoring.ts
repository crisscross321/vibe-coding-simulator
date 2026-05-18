import type { GameState, FinalScore, Grade, ScoreBreakdown, PlayStyle } from '@/types'
import { CAUSAL_LINKS } from '@/lib/causal-chains'

/**
 * 根据游戏最终状态计算评分
 */
export function calculateScore(state: GameState): FinalScore {
  const breakdown = calculateBreakdown(state)

  const totalPoints = Math.round(
    breakdown.completionScore +
    breakdown.qualityScore +
    breakdown.efficiencyScore +
    breakdown.stabilityScore
  )

  const grade = getGrade(totalPoints)
  const dominantStyle = getDominantStyle(state)
  const causalChainsTriggered = countCausalChainsTriggered(state)
  const title = getTitle(state, totalPoints, dominantStyle)

  return {
    totalPoints,
    grade,
    title,
    breakdown,
    dominantStyle,
    causalChainsTriggered,
  }
}

function calculateBreakdown(state: GameState): ScoreBreakdown {
  // completionScore: 0-400
  const completionScore = (state.progress / 100) * 400

  // qualityScore: 0-250
  const qualityScore = (state.codeQuality / 100) * 250

  // efficiencyScore: 0-200 (基于 apiCost 和时间的惩罚)
  // 时间惩罚分母从 300 改为 120（配合新的 60-90 秒目标时长）
  const costPenalty = Math.min(state.apiCost / 200, 1)
  const timePenalty = Math.min(state.elapsedSeconds / 120, 1)
  const efficiencyScore = Math.max(0, (1 - costPenalty * 0.6 - timePenalty * 0.4) * 200)

  // stabilityScore: 0-150 (基于系统健康度和 bug 数)
  const healthFactor = state.systemHealth / 100
  const bugPenalty = Math.min(state.bugs / 20, 1)
  const stabilityScore = Math.max(0, (healthFactor * 0.6 + (1 - bugPenalty) * 0.4) * 150)

  return {
    completionScore: Math.round(completionScore),
    qualityScore: Math.round(qualityScore),
    efficiencyScore: Math.round(efficiencyScore),
    stabilityScore: Math.round(stabilityScore),
  }
}

function getGrade(totalPoints: number): Grade {
  if (totalPoints >= 900) return 'S'
  if (totalPoints >= 750) return 'A'
  if (totalPoints >= 600) return 'B'
  if (totalPoints >= 400) return 'C'
  if (totalPoints >= 200) return 'D'
  return 'F'
}

/**
 * 获取本局主要玩法风格
 */
function getDominantStyle(state: GameState): PlayStyle | null {
  const { styleStats } = state
  const styles: PlayStyle[] = ['speed', 'craft', 'budget', 'gambler']

  let maxCount = 0
  let dominant: PlayStyle | null = null

  for (const style of styles) {
    if (styleStats[style] > maxCount) {
      maxCount = styleStats[style]
      dominant = style
    }
  }

  // 至少要有 2 次才算
  if (maxCount < 2) return null

  return dominant
}

/**
 * 计算触发过的因果链数量
 * 统计有多少因果链的 targetEventId 实际出现在了 eventHistory 中
 */
function countCausalChainsTriggered(state: GameState): number {
  const completedEventIds = new Set(state.eventHistory.map((r) => r.eventId))
  let count = 0

  for (const link of CAUSAL_LINKS) {
    if (
      state.unlockedCausalEvents.includes(link.targetEventId) &&
      completedEventIds.has(link.targetEventId)
    ) {
      count++
    }
  }

  return count
}

/**
 * 根据游戏状态和流派生成搞笑称号
 */
function getTitle(
  state: GameState,
  totalPoints: number,
  dominantStyle: PlayStyle | null
): string {
  // 最高优先级：特殊结局
  if (state.systemHealth <= 0) return 'Moved Fast, Broke Everything 💥'
  if (totalPoints >= 900) return '10x Vibe Engineer 🏆'

  // 流派相关称号（优先级高于通用）
  if (dominantStyle === 'speed' && state.progress >= 100) {
    if (state.elapsedSeconds < 75) return 'Speedrun Any% World Record ⚡'
    return 'The Ship-It Machine 🚀'
  }
  if (dominantStyle === 'craft' && state.codeQuality >= 90) {
    return 'Artisan Code Sculptor 🎨'
  }
  if (dominantStyle === 'budget' && state.apiCost < 10) {
    return 'Chief Penny Pincher 💰'
  }
  if (dominantStyle === 'gambler') {
    if (state.progress >= 100) return 'Casino Royale Developer 🎰'
    return 'Fortune Favors the Bold 🎲'
  }

  // 通用称号
  if (state.bugs === 0 && state.progress >= 100) return 'The Unicorn Whisperer 🦄'
  if (state.apiCost > 150) return 'VC-Funded Hello World 💸'
  if (state.bugs > 15) return 'Senior Bug Farmer 🐛'
  if (state.codeQuality < 20) return 'It Works On My Machine™ 🔥'
  if (state.unlockedCausalEvents.length >= 3) return 'Chaos Butterfly 🦋'

  // 流派确认称号
  if (state.confirmedStyle === 'speed') return 'Velocity Addict ⚡'
  if (state.confirmedStyle === 'craft') return 'Quality Crusader 🛡️'
  if (state.confirmedStyle === 'budget') return 'Bootstrap Minimalist 🧘'
  if (state.confirmedStyle === 'gambler') return 'YOLO Engineer 🎰'

  return 'Professional Vibe Checker ✨'
}
