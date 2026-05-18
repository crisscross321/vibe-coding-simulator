import { createContext, useContext, useCallback, useRef } from 'react'
import type { PropsWithChildren, MutableRefObject } from 'react'
import type { GameState, GameAction, EventChoice, GameEvent } from '@/types'
import { useGameState } from '@/hooks/useGameState'

// ============================================================
// Context 类型
// ============================================================

/** 待处理的玩家选择信息（timer 用于计算结果） */
export interface PendingChoice {
  choice: EventChoice
  event: GameEvent
}

interface GameContextValue {
  state: GameState
  dispatch: React.Dispatch<GameAction>
  /** 共享的 pendingChoice ref，timer 读取用 */
  pendingChoiceRef: MutableRefObject<PendingChoice | null>
}

// ============================================================
// Context 实例
// ============================================================

const GameContext = createContext<GameContextValue | null>(null)

// ============================================================
// Provider
// ============================================================

export function GameProvider({ children }: PropsWithChildren) {
  const [state, rawDispatch] = useGameState()
  const pendingChoiceRef = useRef<PendingChoice | null>(null)
  const stateRef = useRef(state)
  stateRef.current = state

  // 包装 dispatch：拦截 MAKE_CHOICE 存储选择信息供 useGameTimer 读取
  const dispatch: React.Dispatch<GameAction> = useCallback((action: GameAction) => {
    if (action.type === 'MAKE_CHOICE') {
      const currentEvent = stateRef.current.activePrompt
      if (currentEvent) {
        pendingChoiceRef.current = {
          choice: action.choice,
          event: currentEvent,
        }
      }
    }
    rawDispatch(action)
  }, [rawDispatch])

  return (
    <GameContext.Provider value={{ state, dispatch, pendingChoiceRef }}>
      {children}
    </GameContext.Provider>
  )
}

// ============================================================
// Hook
// ============================================================

export function useGame(): GameContextValue {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}
