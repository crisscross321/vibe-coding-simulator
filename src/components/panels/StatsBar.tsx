import { View, Text } from '@tarojs/components'
import { GAME_CONSTANTS } from '@/lib/constants'
import type { MilestoneId } from '@/types'

interface StatsBarProps {
  projectIcon: string
  projectName: string
  progress: number
  elapsedSeconds: number
  codeQuality: number
  bugs: number
  apiCost: number
  systemHealth: number
  currentMilestone: MilestoneId
  milestonesCompleted: MilestoneId[]
  milestoneNames?: Partial<Record<MilestoneId, string>>
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
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

/** 默认阶段名称（兜底） */
const DEFAULT_MILESTONE_NAMES: Record<MilestoneId, string> = {
  init: '启动',
  core: '开发',
  crisis: '深度开发',
  test: '测试',
  launch: '上线',
}

const MILESTONE_ORDER: MilestoneId[] = ['init', 'core', 'crisis', 'test', 'launch']

export default function StatsBar({
  projectIcon,
  projectName,
  progress,
  elapsedSeconds,
  codeQuality,
  bugs,
  apiCost,
  systemHealth,
  currentMilestone,
  milestonesCompleted,
  milestoneNames,
}: StatsBarProps) {
  const thresholds = GAME_CONSTANTS.MILESTONE_THRESHOLDS
  const pct = Math.min(Math.floor(progress), 100)

  // Merge: project-specific names override defaults
  const displayNames: Record<MilestoneId, string> = {
    ...DEFAULT_MILESTONE_NAMES,
    ...milestoneNames,
  }

  return (
    <View className="bg-slate-900 bg-opacity-95 border-b border-slate-700 px-3 py-2">
      {/* Row 1: Project name + 4 stats + timer + percentage */}
      <View className="flex flex-row items-center mb-1.5">
        {/* Project icon + name */}
        <Text className="text-sm mr-1">{projectIcon}</Text>
        <Text className="text-white text-xs font-semibold mr-3">
          {projectName}
        </Text>

        {/* 4 Stats inline: icon + text + value */}
        <View className="flex flex-row items-center flex-1 justify-center gap-3">
          <View className="flex flex-row items-center gap-0.5">
            <Text className="text-xs">💻</Text>
            <Text className="text-slate-400 text-xs">质量</Text>
            <Text className={`text-xs font-bold font-mono ${getQualityColor(codeQuality)}`}>
              {Math.round(codeQuality)}
            </Text>
          </View>
          <View className="flex flex-row items-center gap-0.5">
            <Text className="text-xs">🐛</Text>
            <Text className="text-slate-400 text-xs">Bug</Text>
            <Text className={`text-xs font-bold font-mono ${getBugColor(bugs)}`}>
              {bugs}
            </Text>
          </View>
          <View className="flex flex-row items-center gap-0.5">
            <Text className="text-xs">💰</Text>
            <Text className="text-slate-400 text-xs">费用</Text>
            <Text className="text-xs font-bold font-mono text-amber-400">
              ${apiCost.toFixed(0)}
            </Text>
          </View>
          <View className="flex flex-row items-center gap-0.5">
            <Text className="text-xs">❤️</Text>
            <Text className="text-slate-400 text-xs">血量</Text>
            <Text className={`text-xs font-bold font-mono ${getHealthColor(systemHealth)} ${systemHealth < 30 ? 'health-danger' : ''}`}>
              {Math.round(systemHealth)}
            </Text>
          </View>
        </View>

        {/* Timer + percentage */}
        <View className="flex flex-row items-center ml-3">
          <Text className="text-slate-400 text-xs mr-0.5">⏱</Text>
          <Text className="text-white text-xs font-mono mr-2">{formatTime(elapsedSeconds)}</Text>
          <Text className="text-white text-xs font-mono font-bold">{pct}%</Text>
        </View>
      </View>

      {/* Row 2: Milestone segmented progress bar (replaces plain progress bar) */}
      <View className="flex flex-row items-center gap-0.5">
        {MILESTONE_ORDER.map((milestoneId) => {
          const [start, end] = thresholds[milestoneId]
          const isCompleted = milestonesCompleted.includes(milestoneId)
          const isCurrent = milestoneId === currentMilestone

          // Calculate fill percentage within this segment
          let fillPercent = 0
          if (isCompleted) {
            fillPercent = 100
          } else if (isCurrent) {
            const segmentRange = end - start
            const progressInSegment = Math.max(0, Math.min(progress - start, segmentRange))
            fillPercent = segmentRange > 0 ? (progressInSegment / segmentRange) * 100 : 0
          }

          // Border: current has highlight, others subtle
          const borderClass = isCurrent
            ? 'border border-indigo-500 border-opacity-60'
            : 'border border-slate-700'

          // Fill color: completed=green, current=indigo, future=none
          const fillClass = isCompleted
            ? 'bg-green-500'
            : (isCurrent ? 'bg-indigo-500' : '')

          return (
            <View key={milestoneId} className="flex-1 flex flex-col items-center">
              {/* Segment bar */}
              <View className={`w-full h-2.5 rounded-sm overflow-hidden bg-slate-800 ${borderClass}`}>
                <View
                  className={`h-full rounded-sm milestone-fill-transition ${fillClass}`}
                  style={{ width: `${fillPercent}%` }}
                />
              </View>
              {/* Label */}
              <Text
                className={`mt-0.5 ${isCurrent ? 'text-indigo-400 font-semibold' : (isCompleted ? 'text-green-400' : 'text-slate-500')}`}
                style={{ fontSize: '9px' }}
              >
                {isCompleted ? '✓' : ''}{displayNames[milestoneId]}
              </Text>
            </View>
          )
        })}
      </View>
    </View>
  )
}
