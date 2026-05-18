import { View, Text } from '@tarojs/components'
import { useState } from 'react'
import { EFFECT_DEFINITIONS } from '@/lib/effects'
import type { ActiveEffect, EffectId } from '@/types'

/** Effect display metadata */
const EFFECT_META: Record<EffectId, { icon: string; name: string; description: string; isPositive: boolean }> = {
  tech_debt: { icon: '🔧', name: '技术债', description: '灾难概率上升', isPositive: false },
  fragile_arch: { icon: '🏚️', name: '脆弱架构', description: '部署/重构类事件风险加大', isPositive: false },
  budget_alert: { icon: '💸', name: '预算警报', description: '高成本选项被锁定', isPositive: false },
  overconfidence: { icon: '😎', name: '过度自信', description: '正面结果概率降低', isPositive: false },
  low_morale: { icon: '😞', name: '士气低落', description: '全局成功率下降', isPositive: false },
  tech_credit: { icon: '⭐', name: '技术信用', description: '解锁额外选项', isPositive: true },
}

/** Get clearHint from EFFECT_DEFINITIONS */
function getClearHint(effectId: EffectId): string | null {
  const def = EFFECT_DEFINITIONS.find((d) => d.id === effectId)
  return def?.clearHint ?? null
}

interface ActiveEffectsProps {
  activeEffects: ActiveEffect[]
}

export default function ActiveEffects({ activeEffects }: ActiveEffectsProps) {
  const [tooltipId, setTooltipId] = useState<EffectId | null>(null)

  if (!activeEffects || activeEffects.length === 0) return null

  const handleTap = (effectId: EffectId) => {
    setTooltipId(tooltipId === effectId ? null : effectId)
  }

  return (
    <View className="px-3 py-1">
      <View className="flex flex-row items-center flex-wrap gap-1.5">
        {activeEffects.map((effect) => {
          const meta = EFFECT_META[effect.id]
          if (!meta) return null

          const borderClass = meta.isPositive
            ? 'border-green-500 border-opacity-60'
            : 'border-red-500 border-opacity-60'
          const isShowTooltip = tooltipId === effect.id
          const clearHint = getClearHint(effect.id)

          return (
            <View key={effect.id} className="relative">
              <View
                className={`flex flex-row items-center bg-slate-800 rounded-lg px-2 py-1 border ${borderClass}`}
                onClick={() => handleTap(effect.id)}
              >
                <Text className="text-sm">{meta.icon}</Text>
                {effect.stacks > 1 && (
                  <Text className="text-xs text-white font-bold ml-0.5">
                    x{effect.stacks}
                  </Text>
                )}
              </View>

              {/* Tooltip with clearHint */}
              {isShowTooltip && (
                <View className="absolute bottom-full left-0 mb-1 z-60 tooltip-fade-in">
                  <View className="bg-slate-700 rounded-lg px-3 py-2 border border-slate-600 min-w-36">
                    <Text className="text-white text-xs font-bold block">{meta.name}</Text>
                    <Text className="text-slate-300 text-xs block mt-0.5">{meta.description}</Text>
                    {effect.stacks > 1 && (
                      <Text className="text-slate-400 text-xs block mt-0.5">
                        叠加: {effect.stacks}层
                      </Text>
                    )}
                    {clearHint && (
                      <View className="mt-1.5 pt-1.5 border-t border-slate-600">
                        <Text className="text-green-400 text-xs block">
                          消除条件: {clearHint}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </View>
          )
        })}
      </View>
    </View>
  )
}
