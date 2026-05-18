import { useEffect, useCallback } from 'react'

type KeyAction = 'up' | 'down' | 'enter'

interface UseKeyboardOptions {
  onUp: () => void
  onDown: () => void
  onEnter: () => void
  enabled: boolean
}

/**
 * H5 端键盘监听 hook
 * 监听 ArrowUp / ArrowDown / Enter 按键
 * 小程序端自动跳过（typeof document === 'undefined'）
 */
export function useKeyboard({ onUp, onDown, onEnter, enabled }: UseKeyboardOptions) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return

      let action: KeyAction | null = null

      switch (e.key) {
        case 'ArrowUp':
          action = 'up'
          break
        case 'ArrowDown':
          action = 'down'
          break
        case 'Enter':
          action = 'enter'
          break
        default:
          return
      }

      e.preventDefault()

      if (action === 'up') onUp()
      else if (action === 'down') onDown()
      else if (action === 'enter') onEnter()
    },
    [enabled, onUp, onDown, onEnter]
  )

  useEffect(() => {
    // 仅 H5 端监听键盘事件
    if (typeof document === 'undefined') return

    if (!enabled) return

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [enabled, handleKeyDown])
}
