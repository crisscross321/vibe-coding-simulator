import type { EffectDefinition } from '@/types'

/**
 * 持续效果定义
 * 6 个效果：5 个 debuff + 1 个 buff
 */
export const EFFECT_DEFINITIONS: EffectDefinition[] = [
  {
    id: 'tech_debt',
    name: '技术债累积',
    icon: '🔧',
    description: '重构类事件灾难概率 +20%，代码越来越难改',
    modifiers: {
      catastropheBonus: { refactor: 20 },
    },
    clearHint: '成功完成一次重构类事件可消除',
  },
  {
    id: 'fragile_arch',
    name: '脆弱架构',
    icon: '🏚️',
    description: '部署类事件灾难概率翻倍，系统摇摇欲坠',
    modifiers: {
      catastropheBonus: { deploy: 25 },
    },
    clearHint: '系统健康度恢复到 70 以上可消除',
  },
  {
    id: 'budget_alert',
    name: '预算警报',
    icon: '💸',
    description: '高成本选项被锁定，老板在盯着账单',
    modifiers: {
      lockHighCostChoices: true,
    },
    clearHint: '连续 2 次选择低成本选项后解除',
  },
  {
    id: 'overconfidence',
    name: '过度自信',
    icon: '😎',
    description: '高风险事件出现率提升，团队飘了',
    modifiers: {
      successBonus: -10,
      catastropheBonus: { yolo: 15, deploy: 10 },
    },
    clearHint: '经历一次灾难性结果后恢复清醒',
  },
  {
    id: 'low_morale',
    name: '士气低落',
    icon: '😞',
    description: '所有正面结果概率 -10%，团队萎了',
    modifiers: {
      successBonus: -10,
    },
    clearHint: '连续 2 次获得正面结果可恢复士气',
  },
  {
    id: 'tech_credit',
    name: '技术信用',
    icon: '⭐',
    description: '解锁 Boss 事件额外选项，正面结果 +10%',
    modifiers: {
      successBonus: 10,
      unlockBonusChoice: true,
    },
    clearHint: '在 Boss 事件中使用后消耗',
  },
]
