import { View, Text } from '@tarojs/components'
import { useState, useCallback, useEffect, useImperativeHandle, forwardRef } from 'react'
import { useGame } from '@/context/GameContext'
import { useKeyboard } from '@/hooks/useKeyboard'
import { sortChoicesByRisk, isChoiceLocked, getLockReason, RISK_COLORS } from '@/lib/choice-utils'
import type { GameEvent, EventChoice } from '@/types'

export interface InlinePromptHandle {
  handleUp: () => void
  handleDown: () => void
  handleEnter: () => void
}

interface InlinePromptProps {
  event: GameEvent
  visible: boolean
}

/**
 * 终端内联询问组件
 * 模拟 CLI inline select 样式，嵌入代码区底部而非弹窗遮罩
 * 用于 decisionType === 'permission' 和 'review'
 */
const InlinePrompt = forwardRef<InlinePromptHandle, InlinePromptProps>(
  function InlinePrompt({ event, visible }, ref) {
    const { state, dispatch } = useGame()
    const [selectedIndex, setSelectedIndex] = useState(0)

    const activeEffects = state.activeEffects ?? []
    const sortedChoices = sortChoicesByRisk(event.choices ?? [])

    // Reset selection when event changes
    useEffect(() => {
      setSelectedIndex(0)
    }, [event.id])

    // Find next unlocked index in given direction (circular)
    const findNextUnlocked = useCallback(
      (current: number, direction: 1 | -1): number => {
        const len = sortedChoices.length
        if (len === 0) return 0

        let next = (current + direction + len) % len
        let attempts = 0
        while (isChoiceLocked(sortedChoices[next], activeEffects) && attempts < len) {
          next = (next + direction + len) % len
          attempts++
        }
        return next
      },
      [sortedChoices, activeEffects]
    )

    const handleUp = useCallback(() => {
      setSelectedIndex((prev) => findNextUnlocked(prev, -1))
    }, [findNextUnlocked])

    const handleDown = useCallback(() => {
      setSelectedIndex((prev) => findNextUnlocked(prev, 1))
    }, [findNextUnlocked])

    const handleEnter = useCallback(() => {
      const choice = sortedChoices[selectedIndex]
      if (!choice || isChoiceLocked(choice, activeEffects)) return
      dispatch({ type: 'MAKE_CHOICE', choiceId: choice.id, choice })
    }, [sortedChoices, selectedIndex, activeEffects, dispatch])

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      handleUp,
      handleDown,
      handleEnter,
    }), [handleUp, handleDown, handleEnter])

    const handleChoiceClick = (choice: EventChoice, index: number) => {
      if (isChoiceLocked(choice, activeEffects)) return
      setSelectedIndex(index)
      dispatch({ type: 'MAKE_CHOICE', choiceId: choice.id, choice })
    }

    // Keyboard support (H5 only)
    useKeyboard({
      onUp: handleUp,
      onDown: handleDown,
      onEnter: handleEnter,
      enabled: visible,
    })

    if (!visible) return null

    return (
      <View className="mx-3 mt-2 bg-slate-900 rounded-lg border border-slate-700 overflow-hidden inline-prompt-enter">
        {/* Header: 模拟 CLI prompt */}
        <View className="px-3 py-2 border-b border-slate-700 bg-slate-800">
          <View className="flex flex-row items-center">
            <Text className="text-sm mr-1.5">🤖</Text>
            <Text className="text-slate-300 text-xs font-semibold">
              Claude wants to:
            </Text>
          </View>
          <Text className="text-white text-sm font-bold block mt-1">
            {event.title}
          </Text>
          <Text className="text-slate-400 text-xs block mt-0.5 leading-relaxed">
            {event.description}
          </Text>
        </View>

        {/* Choice list: CLI select style */}
        <View className="py-1.5">
          {sortedChoices.map((choice, index) => {
            const locked = isChoiceLocked(choice, activeEffects)
            const lockReason = getLockReason(choice, activeEffects)
            const isSelected = index === selectedIndex
            const riskColor = RISK_COLORS[choice.riskLevel]

            return (
              <View
                key={choice.id}
                className={`px-3 py-1.5 ${isSelected && !locked ? 'bg-slate-800' : ''}`}
                onClick={() => handleChoiceClick(choice, index)}
              >
                <View className="flex flex-row items-center">
                  {/* Selection indicator */}
                  <Text className={`text-xs font-mono w-4 ${isSelected ? 'text-green-400' : 'text-transparent'}`}>
                    {'>'}
                  </Text>

                  {/* Risk color dot */}
                  <View
                    className="w-2 h-2 rounded-full mr-2 flex-shrink-0"
                    style={{ backgroundColor: locked ? '#475569' : riskColor }}
                  />

                  {/* Choice content */}
                  <View className="flex-1 min-w-0">
                    <View className="flex flex-row items-center">
                      <Text className={`text-sm font-semibold ${locked ? 'text-slate-500' : isSelected ? 'text-white' : 'text-slate-300'}`}>
                        {choice.label}
                      </Text>
                      {locked && (
                        <Text className="text-slate-500 text-xs ml-1">🔒</Text>
                      )}
                      {/* Only show description when NOT locked (avoid duplication with lockReason) */}
                      {!locked && (
                        <Text className={`text-xs ml-2 text-slate-500`}>
                          {choice.description}
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Risk level badge */}
                  <View
                    className="ml-2 px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: locked ? '#1e293b' : `${riskColor}20` }}
                  >
                    <Text
                      className="text-xs font-mono"
                      style={{ color: locked ? '#475569' : riskColor }}
                    >
                      {choice.riskLevel}
                    </Text>
                  </View>
                </View>

                {/* Lock reason (red hint text) */}
                {locked && lockReason && (
                  <View className="ml-6 mt-0.5">
                    <Text className="text-red-400 text-xs">
                      {lockReason}
                    </Text>
                  </View>
                )}
              </View>
            )
          })}
        </View>

        {/* Footer hint */}
        <View className="px-3 py-1.5 border-t border-slate-700 bg-slate-800">
          <Text className="text-slate-500 text-xs font-mono">
            ↑↓ 选择  Enter 确认
          </Text>
        </View>
      </View>
    )
  }
)

export default InlinePrompt
