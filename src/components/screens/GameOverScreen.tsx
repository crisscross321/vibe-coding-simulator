import { View, Text, ScrollView } from '@tarojs/components'
import { useState, useEffect, useRef } from 'react'
import { useGame } from '@/context/GameContext'
import type { Grade, PlayStyle } from '@/types'

const GRADE_COLORS: Record<Grade, string> = {
  S: 'text-yellow-400',
  A: 'text-green-400',
  B: 'text-blue-400',
  C: 'text-yellow-500',
  D: 'text-orange-400',
  F: 'text-red-500',
}

const STYLE_INFO: Record<PlayStyle, { emoji: string; name: string }> = {
  speed: { emoji: '⚡', name: '速度流' },
  craft: { emoji: '🎨', name: '匠心流' },
  budget: { emoji: '💰', name: '省钱流' },
  gambler: { emoji: '🎲', name: '赌徒流' },
}

interface BreakdownItem {
  label: string
  icon: string
  score: number
  maxScore: number
  delay: string
}

function getBarColor(ratio: number): string {
  if (ratio > 0.8) return 'bg-green-500'
  if (ratio > 0.5) return 'bg-yellow-500'
  return 'bg-red-500'
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function GameOverScreen() {
  const { state, dispatch } = useGame()
  const [displayScore, setDisplayScore] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const finalScore = state.finalScore
  const targetScore = finalScore?.totalPoints ?? 0
  const grade = finalScore?.grade ?? 'F'
  const isCompleted = state.gameEndReason === 'completed'
  const dominantStyle = finalScore?.dominantStyle ?? null
  const causalChainsTriggered = finalScore?.causalChainsTriggered ?? 0

  // Score counter animation
  useEffect(() => {
    if (targetScore === 0) return

    const startDelay = 300

    timerRef.current = setTimeout(() => {
      const startTime = Date.now()
      const duration = 1500

      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        // easeOutCubic
        const eased = 1 - Math.pow(1 - progress, 3)
        setDisplayScore(Math.round(eased * targetScore))

        if (progress >= 1 && intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
      }, 16)
    }, startDelay)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [targetScore])

  const handleReset = () => {
    dispatch({ type: 'RESET' })
  }

  const breakdownItems: BreakdownItem[] = finalScore
    ? [
        { label: '完成度', icon: '📊', score: finalScore.breakdown.completionScore, maxScore: 400, delay: 'delay-500' },
        { label: '代码质量', icon: '💎', score: finalScore.breakdown.qualityScore, maxScore: 250, delay: 'delay-700' },
        { label: '效率', icon: '⚡', score: finalScore.breakdown.efficiencyScore, maxScore: 200, delay: 'delay-900' },
        { label: '稳定性', icon: '🛡️', score: finalScore.breakdown.stabilityScore, maxScore: 150, delay: 'delay-1100' },
      ]
    : []

  return (
    <ScrollView scrollY className="min-h-screen bg-slate-900">
      <View className="flex flex-col items-center px-6 py-10">

        {/* a. Title area */}
        <View className="animate-fade-slide-up delay-0 text-center mb-6 w-full">
          <Text className="text-5xl block mb-2">
            {isCompleted ? '🎉' : '💥'}
          </Text>
          <Text className="text-2xl font-bold text-white block mb-2">
            {isCompleted ? '项目交付成功！' : '系统崩溃！'}
          </Text>
          <Text className="text-lg font-bold text-indigo-400 block">
            {finalScore?.title ?? ''}
          </Text>
        </View>

        {/* b. Score overview */}
        <View className="animate-fade-slide-up delay-300 text-center mb-6 w-full">
          <Text className="text-6xl font-extrabold text-white block mb-1">
            {displayScore}
          </Text>
          <Text
            className={`text-4xl font-extrabold block ${GRADE_COLORS[grade]} ${grade === 'S' ? 'grade-shimmer' : ''}`}
          >
            {grade}
          </Text>
        </View>

        {/* b2. Play style & causal chains */}
        <View className="animate-fade-slide-up delay-300 w-full mb-6">
          <View className="flex flex-row gap-3">
            {/* Dominant style card */}
            <View className="flex-1 bg-slate-800 rounded-xl p-3 border border-slate-700 text-center">
              <Text className="text-slate-400 text-xs block mb-1">本局风格</Text>
              {dominantStyle ? (
                <View className="flex flex-row items-center justify-center">
                  <Text className="text-xl mr-1">{STYLE_INFO[dominantStyle].emoji}</Text>
                  <Text className="text-white text-sm font-bold">{STYLE_INFO[dominantStyle].name}</Text>
                </View>
              ) : (
                <Text className="text-slate-500 text-sm">混合流</Text>
              )}
            </View>

            {/* Causal chains card */}
            <View className="flex-1 bg-slate-800 rounded-xl p-3 border border-slate-700 text-center">
              <Text className="text-slate-400 text-xs block mb-1">因果链触发</Text>
              <View className="flex flex-row items-center justify-center">
                <Text className="text-xl mr-1">🔗</Text>
                <Text className="text-white text-sm font-bold">{causalChainsTriggered} 条</Text>
              </View>
            </View>
          </View>
        </View>

        {/* c. Score breakdown cards */}
        <View className="w-full mb-6">
          {breakdownItems.map((item) => {
            const ratio = item.maxScore > 0 ? item.score / item.maxScore : 0
            const barColor = getBarColor(ratio)
            const widthPercent = `${Math.round(ratio * 100)}%`

            return (
              <View
                key={item.label}
                className={`animate-fade-slide-up ${item.delay} bg-slate-800 rounded-xl p-4 mb-3 border border-slate-700`}
              >
                <View className="flex flex-row items-center justify-between mb-2">
                  <View className="flex flex-row items-center">
                    <Text className="text-lg mr-2">{item.icon}</Text>
                    <Text className="text-white text-sm font-semibold">{item.label}</Text>
                  </View>
                  <Text className="text-slate-400 text-sm">
                    {item.score} / {item.maxScore}
                  </Text>
                </View>
                <View className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <View
                    className={`h-full rounded-full score-bar-fill ${barColor}`}
                    style={{ width: widthPercent }}
                  />
                </View>
              </View>
            )
          })}
        </View>

        {/* d. Game data grid */}
        <View className="animate-fade-slide-up delay-1300 w-full mb-6">
          <View className="grid grid-cols-2 gap-3">
            <View className="bg-slate-800 rounded-lg p-3 border border-slate-700 text-center">
              <Text className="text-slate-400 text-xs block mb-1">{'⏱️'} 用时</Text>
              <Text className="text-white text-base font-bold block">
                {formatTime(state.elapsedSeconds)}
              </Text>
            </View>
            <View className="bg-slate-800 rounded-lg p-3 border border-slate-700 text-center">
              <Text className="text-slate-400 text-xs block mb-1">{'📊'} 进度</Text>
              <Text className="text-white text-base font-bold block">
                {Math.floor(state.progress)}%
              </Text>
            </View>
            <View className="bg-slate-800 rounded-lg p-3 border border-slate-700 text-center">
              <Text className="text-slate-400 text-xs block mb-1">{'💻'} 代码质量</Text>
              <Text className="text-white text-base font-bold block">
                {Math.round(state.codeQuality)}/100
              </Text>
            </View>
            <View className="bg-slate-800 rounded-lg p-3 border border-slate-700 text-center">
              <Text className="text-slate-400 text-xs block mb-1">{'🐛'} Bugs</Text>
              <Text className="text-white text-base font-bold block">
                {state.bugs} 个
              </Text>
            </View>
            <View className="bg-slate-800 rounded-lg p-3 border border-slate-700 text-center">
              <Text className="text-slate-400 text-xs block mb-1">{'💰'} API 费用</Text>
              <Text className="text-white text-base font-bold block">
                ${state.apiCost.toFixed(2)}
              </Text>
            </View>
            <View className="bg-slate-800 rounded-lg p-3 border border-slate-700 text-center">
              <Text className="text-slate-400 text-xs block mb-1">{'❤️'} 系统健康</Text>
              <Text className="text-white text-base font-bold block">
                {Math.round(state.systemHealth)}/100
              </Text>
            </View>
          </View>
        </View>

        {/* e. Replay button */}
        <View className="animate-fade-slide-up delay-1600 w-full">
          <View
            className="bg-indigo-600 rounded-xl py-4 active:bg-indigo-700 active:scale-95 transition-all"
            onClick={handleReset}
          >
            <Text className="text-white text-lg font-bold block text-center">
              {'🔄'} 再来一局
            </Text>
          </View>
        </View>

      </View>
    </ScrollView>
  )
}
