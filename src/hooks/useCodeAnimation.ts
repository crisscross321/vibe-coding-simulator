import { useState, useEffect, useRef, useCallback } from 'react'
import { GAME_CONSTANTS } from '@/lib/constants'
import { getSnippetForProgress, getRandomSnippet } from '@/lib/code-snippets'
import type { CodeLine } from '@/lib/code-snippets'

interface CodeAnimationState {
  completedLines: CodeLine[]
  currentLineTokens: { text: string; type: import('@/lib/code-snippets').TokenType }[]
  totalLines: number
}

export function useCodeAnimation(isActive: boolean, progress: number): CodeAnimationState {
  const [completedLines, setCompletedLines] = useState<CodeLine[]>([])
  const [currentLineTokens, setCurrentLineTokens] = useState<{ text: string; type: import('@/lib/code-snippets').TokenType }[]>([])
  const [totalLines, setTotalLines] = useState(0)

  // Refs to keep mutable state across intervals
  const snippetRef = useRef(getSnippetForProgress(progress))
  const lineIndexRef = useRef(0)
  const charIndexRef = useRef(0)
  const flatCharsRef = useRef<{ char: string; type: import('@/lib/code-snippets').TokenType }[]>([])
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const progressRef = useRef(progress)

  // Flatten a CodeLine into individual characters with their types
  const flattenLine = useCallback((line: CodeLine) => {
    const chars: { char: string; type: import('@/lib/code-snippets').TokenType }[] = []
    for (const token of line.tokens) {
      for (const ch of token.text) {
        chars.push({ char: ch, type: token.type })
      }
    }
    return chars
  }, [])

  // Load next line's characters
  const loadNextLine = useCallback(() => {
    const snippet = snippetRef.current
    if (lineIndexRef.current >= snippet.lines.length) {
      // Snippet done — pick a new one based on current progress
      snippetRef.current = progressRef.current !== undefined
        ? getSnippetForProgress(progressRef.current)
        : getRandomSnippet()
      lineIndexRef.current = 0
    }
    const line = snippetRef.current.lines[lineIndexRef.current]
    flatCharsRef.current = flattenLine(line)
    charIndexRef.current = 0
    setCurrentLineTokens([])
  }, [flattenLine])

  // Progress-based snippet switching
  useEffect(() => {
    progressRef.current = progress
  }, [progress])

  // Main typing interval
  useEffect(() => {
    if (!isActive) {
      // Pause typing
      if (intervalRef.current) {
        clearTimeout(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    const tick = () => {
      const chars = flatCharsRef.current
      const idx = charIndexRef.current

      if (idx >= chars.length) {
        // Current line is done — push to completed
        const snippet = snippetRef.current
        const completedLine = snippet.lines[lineIndexRef.current]

        setCompletedLines(prev => {
          const next = [...prev, completedLine]
          // Keep max 30 lines
          if (next.length > GAME_CONSTANTS.CODE_MAX_VISIBLE_LINES) {
            return next.slice(next.length - GAME_CONSTANTS.CODE_MAX_VISIBLE_LINES)
          }
          return next
        })
        setTotalLines(prev => prev + 1)

        lineIndexRef.current += 1
        loadNextLine()

        // Schedule next character after a small line-break pause
        const delay = 80 + Math.random() * 120
        intervalRef.current = setTimeout(tick, delay)
        return
      }

      // Type one character
      charIndexRef.current = idx + 1
      const typedChars = chars.slice(0, idx + 1)

      // Rebuild tokens from typed characters
      const tokens: { text: string; type: import('@/lib/code-snippets').TokenType }[] = []
      let currentToken = { text: '', type: typedChars[0].type }
      for (const ch of typedChars) {
        if (ch.type === currentToken.type) {
          currentToken.text += ch.char
        } else {
          tokens.push({ ...currentToken })
          currentToken = { text: ch.char, type: ch.type }
        }
      }
      tokens.push(currentToken)
      setCurrentLineTokens(tokens)

      // Random delay between characters
      const delay = GAME_CONSTANTS.CODE_CHAR_DELAY_MIN +
        Math.random() * (GAME_CONSTANTS.CODE_CHAR_DELAY_MAX - GAME_CONSTANTS.CODE_CHAR_DELAY_MIN)
      intervalRef.current = setTimeout(tick, delay)
    }

    // Initialize first line if needed
    if (flatCharsRef.current.length === 0) {
      loadNextLine()
    }

    // Start ticking
    intervalRef.current = setTimeout(tick, 50)

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isActive, loadNextLine])

  return { completedLines, currentLineTokens, totalLines }
}
