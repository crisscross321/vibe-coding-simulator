import { View, Text } from '@tarojs/components'
import type { ActiveEffect, EffectId } from '@/types'

interface StatsCardsProps {
  codeQuality: number
  bugs: number
  apiCost: number
  systemHealth: number
  activeEffects?: ActiveEffect[]
}

function getQualityColor(value: number): string {
  if (value >= 60) return 'text-green-400'
  if (value >= 35) return 'text-yellow-400'
  return 'text-red-400'
}

function getBugColor(bugs: number): string {
  if (bugs === 0) return 'text-green-400'
  if (bugs <= 5) return 'text-yellow-400'
  return 'text-red-400'
}

function getHealthColor(health: number): string {
  if (health >= 60) return 'text-green-400'
  if (health >= 30) return 'text-yellow-400'
  return 'text-red-400'
}

/** Map effects to the stats they affect */
const EFFECT_STAT_MAP: Record<EffectId, string[]> = {
  tech_debt: ['quality', 'bugs'],
  fragile_arch: ['health'],
  budget_alert: ['cost'],
  overconfidence: ['quality'],
  low_morale: ['health', 'quality'],
  tech_credit: ['quality'],
}

/** Effect icons for display */
const EFFECT_ICONS: Record<EffectId, string> = {
  tech_debt: '🔧',
  fragile_arch: '🏚️',
  budget_alert: '💸',
  overconfidence: '😎',
  low_morale: '😞',
  tech_credit: '⭐',
}

function getEffectsForStat(stat: string, activeEffects: ActiveEffect[]): string[] {
  const icons: string[] = []
  activeEffects.forEach((effect) => {
    const affectedStats = EFFECT_STAT_MAP[effect.id]
    if (affectedStats && affectedStats.includes(stat)) {
      icons.push(EFFECT_ICONS[effect.id] ?? '⚡')
    }
  })
  return icons
}

interface StatCardProps {
  icon: string
  label: string
  value: string
  colorClass: string
  danger?: boolean
  effectIcons?: string[]
}

function StatCard({ icon, label, value, colorClass, danger, effectIcons }: StatCardProps) {
  return (
    <View className={`flex-1 bg-slate-800 rounded-lg p-2 items-center ${danger ? 'health-danger' : ''}`}>
      <View className="flex flex-row items-center justify-center">
        <Text className="text-base block text-center">{icon}</Text>
        {effectIcons && effectIcons.length > 0 && (
          <Text className="text-xs ml-0.5" style={{ fontSize: '9px' }}>
            {effectIcons.join('')}
          </Text>
        )}
      </View>
      <Text className={`${colorClass} text-sm font-bold block text-center stat-value-transition`}>
        {value}
      </Text>
      <Text className="text-slate-500 text-xs block text-center">{label}</Text>
    </View>
  )
}

export default function StatsCards({ codeQuality, bugs, apiCost, systemHealth, activeEffects = [] }: StatsCardsProps) {
  return (
    <View className="flex flex-row gap-2 px-3">
      <StatCard
        icon="💻"
        label="Quality"
        value={`${Math.round(codeQuality)}`}
        colorClass={getQualityColor(codeQuality)}
        effectIcons={getEffectsForStat('quality', activeEffects)}
      />
      <StatCard
        icon="🐛"
        label="Bugs"
        value={`${bugs}`}
        colorClass={getBugColor(bugs)}
        effectIcons={getEffectsForStat('bugs', activeEffects)}
      />
      <StatCard
        icon="💰"
        label="Cost"
        value={`$${apiCost.toFixed(1)}`}
        colorClass="text-amber-400"
        effectIcons={getEffectsForStat('cost', activeEffects)}
      />
      <StatCard
        icon="❤️"
        label="Health"
        value={`${Math.round(systemHealth)}`}
        colorClass={getHealthColor(systemHealth)}
        danger={systemHealth < 30}
        effectIcons={getEffectsForStat('health', activeEffects)}
      />
    </View>
  )
}
