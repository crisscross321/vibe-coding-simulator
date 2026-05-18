import { View, Text } from '@tarojs/components'
import { useState, useEffect, useRef } from 'react'
import type { OutcomeLevel } from '@/types'

/** 弹幕背景颜色 (半透明) by OutcomeLevel */
const DANMAKU_BG: Record<OutcomeLevel, string> = {
  success: 'rgba(34, 197, 94, 0.85)',
  minor_bug: 'rgba(234, 179, 8, 0.85)',
  moderate: 'rgba(249, 115, 22, 0.85)',
  catastrophe: 'rgba(239, 68, 68, 0.9)',
  safe: 'rgba(59, 130, 246, 0.85)',
  quality_boost: 'rgba(6, 182, 212, 0.85)',
}

/** 弹幕图标 */
const DANMAKU_ICON: Record<OutcomeLevel, string> = {
  success: '✅',
  minor_bug: '⚠️',
  moderate: '🔶',
  catastrophe: '💥',
  safe: '🛡️',
  quality_boost: '✨',
}

interface DanmakuItem {
  id: number
  message: string
  level: OutcomeLevel
}

interface OutcomeDanmakuProps {
  message: string | null
  level: OutcomeLevel | null
}

/**
 * 弹幕式结果反馈组件
 * 结果消息浮现在页面中央偏上，2 秒内向上飘动并渐隐
 * pointer-events: none 不阻塞交互
 */
export default function OutcomeDanmaku({ message, level }: OutcomeDanmakuProps) {
  const [items, setItems] = useState<DanmakuItem[]>([])
  const idCounter = useRef(0)
  const prevMessage = useRef<string | null>(null)

  // Detect new outcome message
  useEffect(() => {
    if (message && level && message !== prevMessage.current) {
      prevMessage.current = message
      const newItem: DanmakuItem = {
        id: ++idCounter.current,
        message,
        level,
      }
      setItems((prev) => [...prev, newItem])

      // Remove after animation completes (2s)
      const timer = setTimeout(() => {
        setItems((prev) => prev.filter((item) => item.id !== newItem.id))
      }, 2200)

      return () => clearTimeout(timer)
    }
    if (!message) {
      prevMessage.current = null
    }
  }, [message, level])

  if (items.length === 0) return null

  return (
    <View className="fixed inset-0 z-40 flex flex-col items-center" style={{ pointerEvents: 'none', top: '30%' }}>
      {items.map((item) => (
        <View
          key={item.id}
          className={`danmaku-float rounded-xl px-4 py-2.5 mb-2 max-w-xs ${item.level === 'catastrophe' ? 'screen-shake' : ''}`}
          style={{
            backgroundColor: DANMAKU_BG[item.level],
            pointerEvents: 'none',
          }}
        >
          <View className="flex flex-row items-center justify-center">
            <Text className="text-base mr-1.5">{DANMAKU_ICON[item.level]}</Text>
            <Text className="text-white text-sm font-semibold text-center leading-relaxed">
              {item.message}
            </Text>
          </View>
        </View>
      ))}
    </View>
  )
}
