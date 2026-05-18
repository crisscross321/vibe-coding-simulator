import { View, Text } from '@tarojs/components'
import { useGame } from '@/context/GameContext'
import { sortChoicesByRisk, isChoiceLocked, getLockReason, RISK_COLORS } from '@/lib/choice-utils'
import type { GameEvent, EventChoice } from '@/types'

/** NPC avatar based on event category */
const NPC_AVATARS: Record<string, { emoji: string; name: string }> = {
  feature: { emoji: '👔', name: '产品经理' },
  deploy: { emoji: '💼', name: '投资人' },
  refactor: { emoji: '🧑‍💻', name: 'CTO' },
  dependency: { emoji: '🧑‍💼', name: '架构师' },
  delete: { emoji: '😈', name: '技术债主' },
  yolo: { emoji: '🤡', name: '实习生' },
}

interface MeetingRoomProps {
  event: GameEvent
  visible: boolean
}

export default function MeetingRoom({ event, visible }: MeetingRoomProps) {
  const { state, dispatch } = useGame()

  if (!visible) return null

  const sortedChoices = sortChoicesByRisk(event.choices ?? [])
  const activeEffects = state.activeEffects ?? []
  const npc = NPC_AVATARS[event.category] ?? { emoji: '👤', name: '未知人士' }

  const handleChoice = (choice: EventChoice) => {
    if (isChoiceLocked(choice, activeEffects)) return
    dispatch({ type: 'MAKE_CHOICE', choiceId: choice.id, choice })
  }

  return (
    <View className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <View className="absolute inset-0 bg-black bg-opacity-70" />

      {/* Meeting room panel */}
      <View className="relative w-full max-w-sm mx-4 mb-4 modal-enter">
        {/* NPC header */}
        <View className="bg-slate-800 rounded-t-2xl border border-slate-600 border-b-0 px-4 pt-4 pb-3">
          {/* NPC avatar area */}
          <View className="flex flex-row items-center mb-3">
            <View className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center mr-3">
              <Text className="text-xl">{npc.emoji}</Text>
            </View>
            <View>
              <Text className="text-white text-sm font-bold block">{npc.name}</Text>
              <Text className="text-slate-500 text-xs block">{event.title}</Text>
            </View>
          </View>

          {/* NPC speech bubble */}
          <View className="bg-slate-700 rounded-2xl rounded-tl-sm px-4 py-3 bubble-appear">
            <Text className="text-slate-200 text-sm leading-relaxed">
              {event.description}
            </Text>
          </View>
        </View>

        {/* Response options — sorted by risk */}
        <View className="bg-slate-850 rounded-b-2xl border border-slate-600 border-t border-t-slate-700 px-4 py-3">
          <Text className="text-slate-500 text-xs block mb-2">你的回复：</Text>
          <View className="flex flex-col gap-2">
            {sortedChoices.map((choice) => {
              const locked = isChoiceLocked(choice, activeEffects)
              const lockReason = getLockReason(choice, activeEffects)
              const riskColor = RISK_COLORS[choice.riskLevel]

              return (
                <View
                  key={choice.id}
                  className={`rounded-xl px-4 py-2.5 ${locked ? 'opacity-50 bg-slate-800' : 'bg-slate-700 active:bg-slate-600 active:scale-98'}`}
                  onClick={() => handleChoice(choice)}
                >
                  <View className="flex flex-row items-center">
                    {/* Risk indicator dot */}
                    <View
                      className="w-2 h-2 rounded-full mr-2.5 flex-shrink-0"
                      style={{ backgroundColor: riskColor }}
                    />
                    <View className="flex-1 min-w-0">
                      <Text className="text-white text-sm font-semibold block">
                        {choice.label}
                        {locked ? ' 🔒' : ''}
                      </Text>
                      {/* Show description only when not locked; show lockReason when locked */}
                      {!locked && (
                        <Text className="text-slate-400 text-xs block mt-0.5">
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
    </View>
  )
}
