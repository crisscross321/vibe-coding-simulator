import { View, Text } from '@tarojs/components'
import { GAME_CONSTANTS } from '@/lib/constants'
import type { MilestoneId } from '@/types'

/**
 * 玩家可见的阶段名称
 * "危机" 阶段对玩家隐藏名称（后台逻辑保留），显示为 "???"
 */
const MILESTONE_DISPLAY: Record<MilestoneId, string> = {
  init: '启动',
  core: '开发',
  crisis: '???',
  test: '测试',
  launch: '上线',
}

const MILESTONE_ORDER: MilestoneId[] = ['init', 'core', 'crisis', 'test', 'launch']

interface MilestoneBarProps {
  currentMilestone: MilestoneId
  milestonesCompleted: MilestoneId[]
  progress: number
}

export default function MilestoneBar({ currentMilestone, milestonesCompleted, progress }: MilestoneBarProps) {
  const thresholds = GAME_CONSTANTS.MILESTONE_THRESHOLDS

  return (
    <View className="px-3 py-1.5">
      {/* Milestone segments */}
      <View className="flex flex-row items-center h-8 gap-0.5">
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

          // Visual styles: completed=green bg, current=indigo border, future=dark
          const borderClass = isCurrent
            ? 'border border-indigo-500 border-opacity-60'
            : (isCompleted ? 'border border-green-600 border-opacity-40' : 'border border-slate-700')

          // Bar fill color
          const fillClass = isCompleted
            ? 'bg-green-500'
            : (isCurrent ? 'bg-indigo-500' : '')

          // Background: completed stays dark (fill covers it), current/future are slate
          const bgClass = 'bg-slate-800'

          return (
            <View key={milestoneId} className="flex-1 flex flex-col items-center">
              {/* Progress segment */}
              <View className={`w-full h-3 rounded-sm overflow-hidden ${bgClass} ${borderClass}`}>
                <View
                  className={`h-full rounded-sm milestone-fill-transition ${fillClass}`}
                  style={{ width: `${fillPercent}%` }}
                />
              </View>
              {/* Label */}
              <View className="flex flex-row items-center mt-0.5">
                {isCompleted && (
                  <Text className="text-green-400" style={{ fontSize: '8px' }}>{'✓ '}</Text>
                )}
                <Text
                  className={`${isCurrent ? 'text-indigo-400 font-semibold' : (isCompleted ? 'text-green-400' : 'text-slate-500')}`}
                  style={{ fontSize: '9px' }}
                >
                  {MILESTONE_DISPLAY[milestoneId]}
                </Text>
              </View>
            </View>
          )
        })}
      </View>
    </View>
  )
}
