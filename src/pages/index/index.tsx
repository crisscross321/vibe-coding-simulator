import { View } from '@tarojs/components'
import { GameProvider } from '@/context/GameContext'
import Game from '@/components/Game'
import './index.scss'

export default function Index() {
  return (
    <View className="index">
      <GameProvider>
        <Game />
      </GameProvider>
    </View>
  )
}
