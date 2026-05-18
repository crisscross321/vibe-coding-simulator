import { useEffect, useRef } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { useCodeAnimation } from '@/hooks/useCodeAnimation'
import type { TokenType } from '@/lib/code-snippets'

const TOKEN_COLORS: Record<TokenType, string> = {
  keyword: 'text-purple-400',
  string: 'text-green-400',
  comment: 'text-slate-500',
  function: 'text-blue-400',
  number: 'text-amber-400',
  variable: 'text-cyan-300',
  operator: 'text-pink-400',
  plain: 'text-slate-200',
}

interface CodeAnimationProps {
  isActive: boolean
  progress: number
}

export default function CodeAnimation({ isActive, progress }: CodeAnimationProps) {
  const { completedLines, currentLineTokens, totalLines } = useCodeAnimation(isActive, progress)
  const scrollTopRef = useRef(0)
  const lineCount = completedLines.length + 1

  // Auto-scroll: increment scrollTop whenever totalLines changes
  useEffect(() => {
    scrollTopRef.current = totalLines * 22
  }, [totalLines])

  return (
    <View className="bg-slate-950 rounded-lg mx-3 overflow-hidden border border-slate-800">
      {/* Editor title bar */}
      <View className="flex flex-row items-center px-3 py-1.5 bg-slate-900 border-b border-slate-800">
        <View className="flex flex-row gap-1.5 mr-3">
          <View className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <View className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
          <View className="w-2.5 h-2.5 rounded-full bg-green-500" />
        </View>
        <Text className="text-slate-500 text-xs font-mono">main.ts — AI is coding...</Text>
      </View>

      {/* Code area */}
      <ScrollView
        scrollY
        scrollTop={scrollTopRef.current}
        scrollWithAnimation
        className="code-scroll-area"
        style={{ height: '280px' }}
      >
        <View className="p-2 font-mono text-xs leading-relaxed">
          {/* Completed lines */}
          {completedLines.map((line, i) => (
            <View key={`line-${totalLines - completedLines.length + i}`} className="flex flex-row min-h-4">
              <Text className="text-slate-600 w-8 text-right mr-3 select-none">
                {totalLines - completedLines.length + i + 1}
              </Text>
              <View className="flex flex-row flex-wrap flex-1">
                {line.tokens.map((token, j) => (
                  <Text key={j} className={TOKEN_COLORS[token.type]}>
                    {token.text}
                  </Text>
                ))}
              </View>
            </View>
          ))}

          {/* Current typing line */}
          <View className="flex flex-row min-h-4">
            <Text className="text-slate-600 w-8 text-right mr-3 select-none">
              {lineCount + (totalLines - completedLines.length)}
            </Text>
            <View className="flex flex-row flex-wrap flex-1">
              {currentLineTokens.map((token, j) => (
                <Text key={j} className={TOKEN_COLORS[token.type]}>
                  {token.text}
                </Text>
              ))}
              {/* Blinking cursor */}
              <Text className="text-slate-200 cursor-blink">|</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
