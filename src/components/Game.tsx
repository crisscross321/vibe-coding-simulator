import { View } from '@tarojs/components'
import { useGame } from '@/context/GameContext'
import MainMenu from '@/components/screens/MainMenu'
import PlayingScreen from '@/components/screens/PlayingScreen'
import GameOverScreen from '@/components/screens/GameOverScreen'

export default function Game() {
  const { state } = useGame()

  return (
    <View className="w-full min-h-screen">
      {state.phase === 'menu' && <MainMenu />}
      {state.phase === 'playing' && <PlayingScreen />}
      {state.phase === 'gameover' && <GameOverScreen />}
    </View>
  )
}
