import { View, Text } from '@tarojs/components'
import { useState, useEffect, useRef } from 'react'
import { useGame } from '@/context/GameContext'
import { useGameTimer } from '@/hooks/useGameTimer'
import StatsBar from '@/components/panels/StatsBar'
import ActiveEffects from '@/components/panels/ActiveEffects'
import CodeAnimation from '@/components/panels/CodeAnimation'
import ActivityLog from '@/components/panels/ActivityLog'
import KeypadBar from '@/components/panels/KeypadBar'
import OutcomeDanmaku from '@/components/panels/OutcomeDanmaku'
import InlinePrompt from '@/components/prompts/InlinePrompt'
import EmergencyAlert from '@/components/prompts/EmergencyAlert'
import MeetingRoom from '@/components/prompts/MeetingRoom'
import type { InlinePromptHandle } from '@/components/prompts/InlinePrompt'

/**
 * 决策类型路由规则：
 * - 内联 (InlinePrompt): permission, review（代码相关的日常决策）
 * - 弹窗 (modal): emergency（紧急警报）, meeting（NPC 会议/Boss）
 *
 * 特殊规则: Boss 事件 (isBoss=true) 无论 decisionType 都使用弹窗
 */
function isModalEvent(decisionType: string | undefined, isBoss?: boolean): boolean {
  if (isBoss) return true
  return decisionType === 'emergency' || decisionType === 'meeting'
}

export default function PlayingScreen() {
  const { state } = useGame()
  const [initializing, setInitializing] = useState(true)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Ref to InlinePrompt imperative methods
  const inlinePromptRef = useRef<InlinePromptHandle>(null)

  // Start the game loop
  useGameTimer()

  // Initializing delay effect
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setInitializing(false)
    }, 1500)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const isCatastrophe = state.lastOutcomeLevel === 'catastrophe'
  const isLowHealth = state.systemHealth < 25
  const bgClass = isLowHealth ? 'bg-red-950' : 'bg-slate-900'

  // Determine prompt type
  const activePrompt = state.activePrompt
  const promptVisible = state.promptVisible
  const decisionType = activePrompt?.decisionType
  const isBoss = activePrompt?.isBoss

  // Is this event rendered inline (not modal)?
  const isInlineActive = promptVisible && activePrompt && !isModalEvent(decisionType, isBoss)
  // Is this event a modal (emergency or meeting or boss)?
  const isModalActive = promptVisible && activePrompt && isModalEvent(decisionType, isBoss)

  // Keypad handlers — read ref at call-time (no stale closure)
  const keypadUp = () => {
    inlinePromptRef.current?.handleUp()
  }
  const keypadDown = () => {
    inlinePromptRef.current?.handleDown()
  }
  const keypadEnter = () => {
    inlinePromptRef.current?.handleEnter()
  }

  if (initializing) {
    return (
      <View className="min-h-screen bg-slate-900 flex flex-col items-center justify-center">
        <Text className="text-3xl block mb-4">{state.project?.icon ?? '🎮'}</Text>
        <Text className="text-white text-lg font-semibold block mb-2">
          {state.project?.name ?? 'Project'}
        </Text>
        <View className="flex flex-row items-center">
          <Text className="loading-spin text-lg mr-2">{'⚙️'}</Text>
          <Text className="text-slate-400 text-sm">Initializing project...</Text>
        </View>
      </View>
    )
  }

  return (
    <View className={`min-h-screen ${bgClass} bg-transition flex flex-col ${isCatastrophe ? 'screen-shake' : ''}`}>
      {/* Top stats bar: project name + 4 stats + timer + milestone progress */}
      <StatsBar
        projectIcon={state.project?.icon ?? '🎮'}
        projectName={state.project?.name ?? 'Unknown'}
        progress={state.progress}
        elapsedSeconds={state.elapsedSeconds}
        codeQuality={state.codeQuality}
        bugs={state.bugs}
        apiCost={state.apiCost}
        systemHealth={state.systemHealth}
        currentMilestone={state.currentMilestone}
        milestonesCompleted={state.milestonesCompleted}
      />

      {/* Active effects bar */}
      <ActiveEffects activeEffects={state.activeEffects} />

      {/* Code animation area */}
      <View className="flex-1 py-2">
        <CodeAnimation
          isActive={!state.promptVisible && state.phase === 'playing'}
          progress={state.progress}
        />

        {/* Inline prompt — embedded below code area (permission & review, non-boss) */}
        {isInlineActive && activePrompt && (
          <InlinePrompt
            event={activePrompt}
            visible={promptVisible}
            ref={inlinePromptRef}
          />
        )}
      </View>

      {/* Divider */}
      <View className="border-t border-slate-700 mx-4" />

      {/* Activity log — only AI activity text */}
      <ActivityLog currentActivity={state.currentActivity} />

      {/* Bottom keypad bar */}
      <KeypadBar
        enabled={!!isInlineActive}
        onUp={keypadUp}
        onDown={keypadDown}
        onEnter={keypadEnter}
      />

      {/* Danmaku outcome feedback — floating above everything */}
      <OutcomeDanmaku
        message={state.lastOutcomeMessage}
        level={state.lastOutcomeLevel}
      />

      {/* Modal prompts — emergency, meeting, and boss events */}
      {isModalActive && activePrompt && decisionType === 'meeting' && (
        <MeetingRoom event={activePrompt} visible={promptVisible} />
      )}
      {isModalActive && activePrompt && decisionType !== 'meeting' && (
        <EmergencyAlert event={activePrompt} visible={promptVisible} />
      )}
    </View>
  )
}
