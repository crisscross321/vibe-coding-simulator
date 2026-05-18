import type { EventChoice, RiskLevel, ActiveEffect, EffectId } from '@/types'

// ============================================================
// 选项排序、锁定检查、锁定原因 — 公共工具函数
// ============================================================

/** 风险等级排序权重：extreme 最前（最危险），low 最后 */
const RISK_ORDER: Record<RiskLevel, number> = {
  extreme: 0,
  high: 1,
  medium: 2,
  low: 3,
}

/** 风险等级对应颜色 (hex) */
export const RISK_COLORS: Record<RiskLevel, string> = {
  extreme: '#a855f7',
  high: '#ef4444',
  medium: '#eab308',
  low: '#22c55e',
}

/** 风险等级中文标签 */
export const RISK_LABELS: Record<RiskLevel, string> = {
  low: '低风险',
  medium: '中风险',
  high: '高风险',
  extreme: '极限',
}

/**
 * 按风险从高到低排序选项
 * extreme → high → medium → low
 */
export function sortChoicesByRisk(choices: EventChoice[]): EventChoice[] {
  return [...choices].sort((a, b) => RISK_ORDER[a.riskLevel] - RISK_ORDER[b.riskLevel])
}

/** 检查是否拥有某个效果 */
function hasEffect(effects: ActiveEffect[], effectId: EffectId): boolean {
  return effects.some((e) => e.id === effectId)
}

/** 判断选项是否被锁定 */
export function isChoiceLocked(choice: EventChoice, activeEffects: ActiveEffect[]): boolean {
  if (choice.requiresEffect && !hasEffect(activeEffects, choice.requiresEffect)) {
    return true
  }
  if (choice.isHighCost && hasEffect(activeEffects, 'budget_alert')) {
    return true
  }
  return false
}

/**
 * 获取选项锁定原因文案
 * 返回 null 表示未锁定
 */
export function getLockReason(choice: EventChoice, activeEffects: ActiveEffect[]): string | null {
  if (choice.requiresEffect && !hasEffect(activeEffects, choice.requiresEffect)) {
    if (choice.requiresEffect === 'tech_credit') {
      return '需要「技术信用 ⭐」'
    }
    return `需要「${choice.requiresEffect}」效果`
  }
  if (choice.isHighCost && hasEffect(activeEffects, 'budget_alert')) {
    return '「预算警报 💸」期间不可选'
  }
  return null
}
