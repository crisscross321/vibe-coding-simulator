import { View, Text } from '@tarojs/components'

interface ActivityLogProps {
  currentActivity: string
}

/**
 * AI 活动日志 — 只显示当前 AI 活动文字
 * 结果消息已移至 OutcomeDanmaku 弹幕组件
 */
export default function ActivityLog({ currentActivity }: ActivityLogProps) {
  return (
    <View className="mx-3 py-2">
      <View className="flex flex-row items-center">
        <Text className="text-base mr-1.5 loading-spin">⟳</Text>
        <Text className="text-slate-400 text-xs flex-1" numberOfLines={1}>
          {currentActivity || 'AI is thinking...'}
        </Text>
      </View>
    </View>
  )
}
