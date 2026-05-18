import { useEffect, useRef, useCallback } from 'react'
import { GAME_CONSTANTS } from '@/lib/constants'
import { MILESTONES } from '@/lib/milestones'
import { useGame } from '@/context/GameContext'
import {
  selectEvent,
  resolveOutcome,
  getNextPromptDelay,
  getActivityMessage,
  getBossEvent,
  checkEffectTriggers,
  checkEffectClears,
  checkCausalLinks,
} from '@/lib/game-engine'
import { calculateScore } from '@/lib/scoring'
import type { MilestoneId } from '@/types'

export function useGameTimer() {
  const { state, dispatch, pendingChoiceRef } = useGame()

  const nextPromptTimeRef = useRef<number>(Date.now() + getNextPromptDelay())
  const gameEndedRef = useRef(false)
  const outcomeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 跟踪待触发的 Boss 事件
  const pendingBossRef = useRef<string | null>(null)

  // 跟踪 promptVisible 变化以检测 MAKE_CHOICE
  const prevPromptVisibleRef = useRef(state.promptVisible)

  // ============================================================
  // 初始化重置
  // ============================================================
  useEffect(() => {
    if (state.phase === 'playing' && state.elapsedSeconds === 0) {
      nextPromptTimeRef.current = Date.now() + getNextPromptDelay()
      gameEndedRef.current = false
      pendingBossRef.current = null
      prevPromptVisibleRef.current = false
    }
  }, [state.phase, state.elapsedSeconds])

  // ============================================================
  // 监听玩家选择：promptVisible 从 true→false 时处理结果
  // 组件 dispatch MAKE_CHOICE → Context 拦截并写入 pendingChoiceRef
  // → reducer 设置 promptVisible=false → 本 effect 触发处理
  // ============================================================
  useEffect(() => {
    const wasVisible = prevPromptVisibleRef.current
    const isVisible = state.promptVisible
    prevPromptVisibleRef.current = isVisible

    // 弹窗刚关闭（MAKE_CHOICE 触发）
    if (wasVisible && !isVisible && state.phase === 'playing') {
      const pending = pendingChoiceRef.current
      if (!pending) return
      pendingChoiceRef.current = null

      const { choice, event } = pending

      // 1. 计算结果（应用效果修改器 + 流派加成）
      const outcome = resolveOutcome(
        choice.outcomes,
        state.activeEffects,
        event.category,
        state.confirmedStyle,
        choice.style
      )

      // 2. 应用结果
      dispatch({
        type: 'APPLY_OUTCOME',
        outcome,
        choiceId: choice.id,
        style: choice.style,
      })

      // 3. 触发持续效果（outcome 附带的）
      if (outcome.applyEffect) {
        dispatch({ type: 'APPLY_EFFECT', effectId: outcome.applyEffect })
      }

      // 4. 清除持续效果（outcome 附带的）
      if (outcome.clearEffect) {
        dispatch({ type: 'CLEAR_EFFECT', effectId: outcome.clearEffect })
      }

      // 5. 检查因果链
      const newUnlocks = checkCausalLinks(
        event.id,
        choice.id,
        outcome.level,
        state.unlockedCausalEvents
      )
      for (const targetId of newUnlocks) {
        dispatch({ type: 'UNLOCK_CAUSAL_EVENT', eventId: targetId })
      }

      // 6. 清除结果消息定时器
      if (outcomeTimerRef.current) clearTimeout(outcomeTimerRef.current)
      outcomeTimerRef.current = setTimeout(() => {
        dispatch({ type: 'CLEAR_OUTCOME_MESSAGE' })
      }, GAME_CONSTANTS.OUTCOME_MESSAGE_DURATION)

      // 7. 更新活动消息
      if (state.project) {
        const msg = getActivityMessage(state.progress, state.project)
        dispatch({ type: 'UPDATE_ACTIVITY', activity: msg })
      }

      // 8. 设置下一次弹窗时间
      nextPromptTimeRef.current = Date.now() + getNextPromptDelay()
    }
  }, [
    state.promptVisible,
    state.phase,
    state.activeEffects,
    state.confirmedStyle,
    state.unlockedCausalEvents,
    state.progress,
    state.project,
    pendingChoiceRef,
    dispatch,
  ])

  // ============================================================
  // 里程碑检测
  // ============================================================
  const checkMilestone = useCallback(() => {
    const currentProgress = state.progress
    const { MILESTONE_THRESHOLDS } = GAME_CONSTANTS

    // 里程碑顺序
    const milestoneOrder: MilestoneId[] = ['init', 'core', 'crisis', 'test', 'launch']
    const currentIndex = milestoneOrder.indexOf(state.currentMilestone)

    // 检查是否应该进入下一个阶段
    for (let i = currentIndex + 1; i < milestoneOrder.length; i++) {
      const nextMilestone = milestoneOrder[i]
      const threshold = MILESTONE_THRESHOLDS[nextMilestone]

      if (currentProgress >= threshold[0]) {
        dispatch({ type: 'ADVANCE_MILESTONE', milestone: nextMilestone })

        // 检查该阶段是否有 Boss 事件
        const milestoneDef = MILESTONES.find((m) => m.id === nextMilestone)
        if (milestoneDef?.bossEventId) {
          pendingBossRef.current = milestoneDef.bossEventId
        }
        break // 一次只进一个阶段
      }
    }
  }, [state.progress, state.currentMilestone, dispatch])

  // ============================================================
  // 效果系统 tick 检查
  // ============================================================
  const checkEffects = useCallback(() => {
    // 检查应触发的新效果
    const newEffect = checkEffectTriggers(state)
    if (newEffect) {
      dispatch({ type: 'APPLY_EFFECT', effectId: newEffect })
    }

    // 检查应消除的效果
    const clearEffects = checkEffectClears(state)
    for (const effectId of clearEffects) {
      dispatch({ type: 'CLEAR_EFFECT', effectId })
    }
  }, [state, dispatch])

  // ============================================================
  // 胜负检测
  // ============================================================
  const checkEndCondition = useCallback(() => {
    if (gameEndedRef.current || state.phase !== 'playing') return

    if (state.progress >= GAME_CONSTANTS.WIN_PROGRESS) {
      gameEndedRef.current = true
      dispatch({ type: 'END_GAME', reason: 'completed' })
      const score = calculateScore(state)
      dispatch({ type: 'SET_SCORE', score })
    } else if (state.systemHealth <= GAME_CONSTANTS.LOSE_HEALTH) {
      gameEndedRef.current = true
      dispatch({ type: 'END_GAME', reason: 'crashed' })
      const score = calculateScore(state)
      dispatch({ type: 'SET_SCORE', score })
    }
  }, [state, dispatch])

  // ============================================================
  // 主循环：每秒 tick
  // ============================================================
  useEffect(() => {
    if (state.phase !== 'playing') return

    const interval = setInterval(() => {
      // 1. 每秒 tick
      dispatch({ type: 'TICK' })

      // 2. 随机更新活动消息（15% 概率，无弹窗时）
      if (state.project && !state.promptVisible && Math.random() < 0.15) {
        const msg = getActivityMessage(state.progress, state.project)
        dispatch({ type: 'UPDATE_ACTIVITY', activity: msg })
      }

      // 3. 里程碑检测
      checkMilestone()

      // 4. 效果系统检查
      checkEffects()

      // 5. 弹窗触发检查
      if (!state.promptVisible && Date.now() >= nextPromptTimeRef.current) {
        // 如果有待触发的 Boss → 强制显示 Boss 事件
        if (pendingBossRef.current) {
          const bossEvent = getBossEvent(pendingBossRef.current)
          if (bossEvent) {
            dispatch({ type: 'SHOW_PROMPT', event: bossEvent })
            pendingBossRef.current = null
          } else {
            // Boss 事件不存在（数据文件未配置），跳过并显示普通事件
            pendingBossRef.current = null
            showNormalEvent()
          }
        } else {
          showNormalEvent()
        }
      }
    }, 1000)

    function showNormalEvent() {
      const recentIds = state.eventHistory.slice(-3).map((e) => e.eventId)
      const event = selectEvent(
        state.progress,
        recentIds,
        state.activeEffects,
        state.unlockedCausalEvents,
        state.project?.id ?? '',
        state.eventsCompleted,
        state.eventHistory
      )
      if (event) {
        dispatch({ type: 'SHOW_PROMPT', event })
      }
    }

    return () => clearInterval(interval)
  }, [
    state.phase,
    state.promptVisible,
    state.progress,
    state.project,
    state.eventHistory,
    state.activeEffects,
    state.unlockedCausalEvents,
    state.eventsCompleted,
    checkMilestone,
    checkEffects,
    dispatch,
  ])

  // ============================================================
  // 胜负检测（每次状态变化后）
  // ============================================================
  useEffect(() => {
    checkEndCondition()
  }, [checkEndCondition])

  // ============================================================
  // Cleanup
  // ============================================================
  useEffect(() => {
    return () => {
      if (outcomeTimerRef.current) clearTimeout(outcomeTimerRef.current)
    }
  }, [])
}
