import { View, Text } from '@tarojs/components'

interface KeypadBarProps {
  enabled: boolean
  onUp: () => void
  onDown: () => void
  onEnter: () => void
}

/**
 * 底部虚拟按键条
 * 三个按钮：↑ / ↓ / Enter⏎
 * 无事件时灰显（disabled），有事件时高亮可点击
 */
export default function KeypadBar({ enabled, onUp, onDown, onEnter }: KeypadBarProps) {
  const btnBase = 'flex-1 flex items-center justify-center rounded-lg py-2.5 mx-1'
  const btnEnabled = 'bg-slate-700 active:bg-slate-600 active:scale-95'
  const btnDisabled = 'bg-slate-800 opacity-40'

  const textEnabled = 'text-white text-base font-bold'
  const textDisabled = 'text-slate-500 text-base font-bold'

  const labelEnabled = 'text-slate-400 text-xs mt-0.5'
  const labelDisabled = 'text-slate-600 text-xs mt-0.5'

  return (
    <View className="px-3 py-2 bg-slate-900 border-t border-slate-700">
      <View className="flex flex-row">
        {/* Up button */}
        <View
          className={`${btnBase} ${enabled ? btnEnabled : btnDisabled}`}
          onClick={enabled ? onUp : undefined}
        >
          <View className="flex flex-col items-center">
            <Text className={enabled ? textEnabled : textDisabled}>↑</Text>
            <Text className={enabled ? labelEnabled : labelDisabled}>上一个</Text>
          </View>
        </View>

        {/* Down button */}
        <View
          className={`${btnBase} ${enabled ? btnEnabled : btnDisabled}`}
          onClick={enabled ? onDown : undefined}
        >
          <View className="flex flex-col items-center">
            <Text className={enabled ? textEnabled : textDisabled}>↓</Text>
            <Text className={enabled ? labelEnabled : labelDisabled}>下一个</Text>
          </View>
        </View>

        {/* Enter button */}
        <View
          className={`${btnBase} ${enabled ? 'bg-green-700 active:bg-green-600 active:scale-95' : btnDisabled}`}
          onClick={enabled ? onEnter : undefined}
        >
          <View className="flex flex-col items-center">
            <Text className={enabled ? textEnabled : textDisabled}>⏎</Text>
            <Text className={enabled ? 'text-green-200 text-xs mt-0.5' : labelDisabled}>确认</Text>
          </View>
        </View>
      </View>
    </View>
  )
}
