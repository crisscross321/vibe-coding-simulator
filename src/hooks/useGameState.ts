import { useReducer } from 'react'
import { GAME_CONSTANTS } from '@/lib/constants'
import type {
  GameState,
  GameAction,
  PlayStyle,
  ActiveEffect,
} from '@/types'

// ============================================================
// 初始状态
// ============================================================

const initialState: GameState = {
  phase: 'menu',
  project: null,

  // 五大指标
  progress: 0,
  codeQuality: GAME_CONSTANTS.INITIAL_CODE_QUALITY,
  bugs: 0,
  apiCost: 0,
  systemHealth: GAME_CONSTANTS.INITIAL_SYSTEM_HEALTH,

  // 里程碑
  currentMilestone: 'init',
  milestonesCompleted: [],

  // 持续效果
  activeEffects: [],

  // 流派追踪
  styleStats: { speed: 0, craft: 0, budget: 0, gambler: 0 },
  confirmedStyle: null,

  // 游戏进程
  elapsedSeconds: 0,
  currentActivity: '',
  eventsCompleted: 0,
  eventHistory: [],

  // 因果链
  unlockedCausalEvents: [],

  // 弹窗状态
  activePrompt: null,
  promptVisible: false,

  // 结果反馈
  lastOutcomeMessage: null,
  lastOutcomeLevel: null,

  // 结算
  finalScore: null,
  gameEndReason: null,
}

// ============================================================
// 工具函数
// ============================================================

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * 检测流派确认：最近 N 次选择是否为同一流派
 */
function detectStyleConfirm(
  _styleStats: GameState['styleStats'],
  eventHistory: GameState['eventHistory'],
  currentConfirmed: PlayStyle | null
): PlayStyle | null {
  // 如果已经确认过，不重新检测
  if (currentConfirmed) return currentConfirmed

  const streak = GAME_CONSTANTS.STYLE_CONFIRM_STREAK
  if (eventHistory.length < streak) return null

  const recentStyles = eventHistory.slice(-streak).map(e => e.choiceStyle)
  const firstStyle = recentStyles[0]

  if (recentStyles.every(s => s === firstStyle)) {
    return firstStyle
  }

  return null
}

// ============================================================
// Reducer
// ============================================================

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME': {
      return {
        ...initialState,
        phase: 'playing',
        project: action.project,
        currentActivity: 'Initializing project...',
        currentMilestone: 'init',
        milestonesCompleted: [],
        activeEffects: [],
        styleStats: { speed: 0, craft: 0, budget: 0, gambler: 0 },
        confirmedStyle: null,
        unlockedCausalEvents: [],
      }
    }

    case 'TICK': {
      if (state.phase !== 'playing') return state

      const newElapsed = state.elapsedSeconds + 1

      // 如果没有弹窗：被动进度 + API 成本
      if (!state.promptVisible) {
        const newProgress = clamp(
          state.progress + GAME_CONSTANTS.IDLE_PROGRESS_PER_SECOND,
          0,
          GAME_CONSTANTS.WIN_PROGRESS
        )
        const newApiCost = state.apiCost + GAME_CONSTANTS.IDLE_API_COST_PER_SECOND

        return {
          ...state,
          elapsedSeconds: newElapsed,
          progress: newProgress,
          apiCost: Math.round(newApiCost * 100) / 100,
        }
      }

      return {
        ...state,
        elapsedSeconds: newElapsed,
      }
    }

    case 'SHOW_PROMPT': {
      return {
        ...state,
        activePrompt: action.event,
        promptVisible: true,
      }
    }

    case 'MAKE_CHOICE': {
      // 关闭弹窗，记录选择
      // 实际结果计算由 useGameTimer 完成后 dispatch APPLY_OUTCOME
      return {
        ...state,
        promptVisible: false,
      }
    }

    case 'APPLY_OUTCOME': {
      const { outcome, choiceId, style } = action
      const effects = outcome.effects

      // 应用五大指标
      const newProgress = clamp(
        state.progress + (effects.progress ?? 0),
        0,
        GAME_CONSTANTS.WIN_PROGRESS
      )
      const newCodeQuality = clamp(
        state.codeQuality + (effects.codeQuality ?? 0),
        0,
        100
      )
      const newBugs = Math.max(0, state.bugs + (effects.bugs ?? 0))
      const newApiCost = Math.max(
        0,
        Math.round((state.apiCost + (effects.apiCost ?? 0)) * 100) / 100
      )
      const newSystemHealth = clamp(
        state.systemHealth + (effects.systemHealth ?? 0),
        0,
        100
      )

      // 记录事件历史
      const eventResult = {
        eventId: state.activePrompt?.id ?? 'unknown',
        choiceId,
        choiceStyle: style,
        outcome,
        timestamp: state.elapsedSeconds,
      }

      const newEventHistory = [...state.eventHistory, eventResult]

      // 更新流派统计
      const newStyleStats = {
        ...state.styleStats,
        [style]: state.styleStats[style] + 1,
      }

      // 检测流派确认
      const newConfirmedStyle = detectStyleConfirm(
        newStyleStats,
        newEventHistory,
        state.confirmedStyle
      )

      return {
        ...state,
        progress: newProgress,
        codeQuality: newCodeQuality,
        bugs: newBugs,
        apiCost: newApiCost,
        systemHealth: newSystemHealth,
        eventsCompleted: state.eventsCompleted + 1,
        eventHistory: newEventHistory,
        styleStats: newStyleStats,
        confirmedStyle: newConfirmedStyle,
        lastOutcomeMessage: outcome.message,
        lastOutcomeLevel: outcome.level,
      }
    }

    case 'APPLY_EFFECT': {
      const { effectId } = action
      const existing = state.activeEffects.find(e => e.id === effectId)

      let newEffects: ActiveEffect[]

      if (existing) {
        // 叠加层数，最大 MAX_EFFECT_STACKS
        newEffects = state.activeEffects.map(e =>
          e.id === effectId
            ? { ...e, stacks: Math.min(e.stacks + 1, GAME_CONSTANTS.MAX_EFFECT_STACKS) }
            : e
        )
      } else {
        // 新增效果
        newEffects = [
          ...state.activeEffects,
          { id: effectId, appliedAt: state.elapsedSeconds, stacks: 1 },
        ]
      }

      return {
        ...state,
        activeEffects: newEffects,
      }
    }

    case 'CLEAR_EFFECT': {
      return {
        ...state,
        activeEffects: state.activeEffects.filter(e => e.id !== action.effectId),
      }
    }

    case 'ADVANCE_MILESTONE': {
      const { milestone } = action
      return {
        ...state,
        currentMilestone: milestone,
        milestonesCompleted: [...state.milestonesCompleted, milestone],
      }
    }

    case 'UNLOCK_CAUSAL_EVENT': {
      if (state.unlockedCausalEvents.includes(action.eventId)) {
        return state
      }
      return {
        ...state,
        unlockedCausalEvents: [...state.unlockedCausalEvents, action.eventId],
      }
    }

    case 'CLEAR_OUTCOME_MESSAGE': {
      return {
        ...state,
        lastOutcomeMessage: null,
        lastOutcomeLevel: null,
      }
    }

    case 'UPDATE_ACTIVITY': {
      return {
        ...state,
        currentActivity: action.activity,
      }
    }

    case 'END_GAME': {
      return {
        ...state,
        phase: 'gameover',
        gameEndReason: action.reason,
      }
    }

    case 'SET_SCORE': {
      return {
        ...state,
        finalScore: action.score,
      }
    }

    case 'RESET': {
      return { ...initialState }
    }

    default:
      return state
  }
}

// ============================================================
// Hook 导出
// ============================================================

export function useGameState() {
  return useReducer(gameReducer, initialState)
}

export { initialState, gameReducer }
