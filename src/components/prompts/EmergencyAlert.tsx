import { View, Text } from '@tarojs/components'
import { useEffect, useRef, useState } from 'react'
import { useGame } from '@/context/GameContext'
import { GAME_CONSTANTS } from '@/lib/constants'
import { sortChoicesByRisk, isChoiceLocked, getLockReason, RISK_COLORS } from '@/lib/choice-utils'
import type { GameEvent, EventChoice } from '@/types'

interface EmergencyAlertProps {
  event: GameEvent
  visible: boolean
}

export default function EmergencyAlert({ event, visible }: EmergencyAlertProps) {
  const { state, dispatch } = useGame()
  const [timeLeft, setTimeLeft] = useState<number>(GAME_CONSTANTS.EMERGENCY_TIMEOUT_SECONDS)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const hasAutoSelected = useRef(false)

  const sortedChoices = sortChoicesByRisk(event.choices ?? [])
  const activeEffects = state.activeEffects ?? []
  const totalTime = GAME_CONSTANTS.EMERGENCY_TIMEOUT_SECONDS

  // Countdown timer
  useEffect(() => {
    if (!visible) return

    hasAutoSelected.current = false
    setTimeLeft(totalTime)

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1
        if (next <= 0 && !hasAutoSelected.current) {
          hasAutoSelected.current = true
          // Auto-select first UNLOCKED choice on timeout
          const unlockedChoices = sortedChoices.filter(
            c => !isChoiceLocked(c, activeEffects)
          )
          const firstChoice = unlockedChoices[0] ?? sortedChoices[0]
          if (firstChoice) {
            dispatch({ type: 'MAKE_CHOICE', choiceId: firstChoice.id, choice: firstChoice })
          }
        }
        return Math.max(next, 0)
      })
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [visible, event.id])

  if (!visible) return null

  const handleChoice = (choice: EventChoice) => {
    if (isChoiceLocked(choice, activeEffects)) return
    if (hasAutoSelected.current) return
    hasAutoSelected.current = true
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    dispatch({ type: 'MAKE_CHOICE', choiceId: choice.id, choice })
  }

  const countdownDuration = `${totalTime}s`

  return (
    <View className="fixed inset-0 z-50 flex items-center justify-center emergency-bg-pulse">
      {/* Content */}
      <View className="relative w-full max-w-sm mx-4">
        {/* Alert header */}
        <View className="text-center mb-4">
          <Text className="text-4xl block mb-2">⚠️</Text>
          <Text className="text-white text-xl font-bold block mb-1">
            紧急警报
          </Text>
          <Text className="text-red-200 text-sm block mb-2">
            {event.title}
          </Text>
          <Text className="text-red-300 text-xs block leading-relaxed">
            {event.description}
          </Text>
        </View>

        {/* Countdown bar */}
        <View className="mb-4 px-2">
          <View className="flex flex-row items-center justify-between mb-1">
            <Text className="text-red-200 text-xs">剩余时间</Text>
            <Text className="text-white text-sm font-bold font-mono">{timeLeft}s</Text>
          </View>
          <View className="w-full h-2 bg-red-900 rounded-full overflow-hidden">
            <View
              className="h-full bg-red-400 rounded-full countdown-bar-animate"
              style={{ '--countdown-duration': countdownDuration } as React.CSSProperties}
            />
          </View>
        </View>

        {/* Choice cards — sorted by risk */}
        <View className="flex flex-col gap-2">
          {sortedChoices.map((choice) => {
            const locked = isChoiceLocked(choice, activeEffects)
            const lockReason = getLockReason(choice, activeEffects)
            const riskColor = RISK_COLORS[choice.riskLevel]

            return (
              <View
                key={choice.id}
                className={`relative rounded-xl border overflow-hidden ${locked ? 'opacity-50 border-red-900 bg-red-950' : 'border-red-700 bg-red-900 bg-opacity-80 active:bg-red-800 active:scale-98'}`}
                onClick={() => handleChoice(choice)}
              >
                {/* Risk color left bar */}
                <View
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                  style={{ backgroundColor: riskColor }}
                />

                <View className="pl-4 pr-3 py-2.5 flex flex-row items-center">
                  <View className="flex-1 min-w-0">
                    <View className="flex flex-row items-center mb-0.5">
                      <Text className="text-white text-sm font-bold">
                        {choice.label}
                      </Text>
                      {locked && (
                        <Text className="text-red-400 text-sm ml-1.5">🔒</Text>
                      )}
                    </View>
                    {/* Show description only when not locked; show lockReason when locked */}
                    {!locked && (
                      <Text className="text-red-200 text-xs">
                        {choice.description}
                      </Text>
                    )}
                    {locked && lockReason && (
                      <Text className="text-red-400 text-xs block mt-0.5">
                        {lockReason}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            )
          })}
        </View>
      </View>
    </View>
  )
}
