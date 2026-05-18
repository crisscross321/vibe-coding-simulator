import { View, Text, ScrollView } from '@tarojs/components'
import { useGame } from '@/context/GameContext'
import { PROJECTS } from '@/lib/projects'
import type { ProjectConfig } from '@/types'

const DIFFICULTY_STYLES: Record<ProjectConfig['difficulty'], { bg: string; text: string; label: string }> = {
  easy: { bg: 'bg-green-900', text: 'text-green-400', label: 'Easy' },
  normal: { bg: 'bg-yellow-900', text: 'text-yellow-400', label: 'Normal' },
  hard: { bg: 'bg-red-900', text: 'text-red-400', label: 'Hard' },
}

function ProjectCard({ project }: { project: ProjectConfig }) {
  const { dispatch } = useGame()
  const diff = DIFFICULTY_STYLES[project.difficulty]

  const handleSelect = () => {
    dispatch({ type: 'START_GAME', project })
  }

  return (
    <View
      className="bg-slate-800 rounded-xl p-4 border border-slate-700 active:border-indigo-500 active:scale-95 transition-all shadow-lg shadow-black"
      onClick={handleSelect}
    >
      <View className="flex flex-row items-center justify-between mb-2">
        <Text className="text-3xl">{project.icon}</Text>
        <View className={`${diff.bg} rounded-full px-2 py-0.5`}>
          <Text className={`${diff.text} text-xs font-semibold`}>{diff.label}</Text>
        </View>
      </View>

      <Text className="text-white text-base font-bold mb-1 block">
        {project.name}
      </Text>

      <Text className="text-slate-400 text-xs leading-relaxed block mb-3">
        {project.description}
      </Text>

      <View className="flex flex-row flex-wrap gap-1">
        {project.features.slice(0, 3).map((feat) => (
          <View key={feat} className="bg-slate-700 rounded px-1.5 py-0.5">
            <Text className="text-slate-300 text-xs">{feat}</Text>
          </View>
        ))}
        {project.features.length > 3 && (
          <View className="bg-slate-700 rounded px-1.5 py-0.5">
            <Text className="text-slate-500 text-xs">+{project.features.length - 3}</Text>
          </View>
        )}
      </View>
    </View>
  )
}

export default function MainMenu() {
  return (
    <View className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <View className="pt-12 pb-4 px-6 text-center">
        <Text className="text-4xl block mb-1 animate-float">{'🎮'}</Text>
        <Text className="text-2xl font-extrabold text-white block mb-1">
          Vibe Coding Simulator
        </Text>
        <Text className="text-sm text-slate-400 block">
          氛围编程模拟器
        </Text>
      </View>

      {/* Project Grid */}
      <ScrollView scrollY className="flex-1 px-4 pb-4">
        <View className="grid grid-cols-2 gap-3">
          {PROJECTS.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </View>
      </ScrollView>

      {/* Footer */}
      <View className="pb-8 pt-2 text-center">
        <Text className="text-xs text-slate-500 block mb-1">
          选择一个项目，让 AI 帮你完成 ✨
        </Text>
        <Text className="text-xs text-slate-600">v1.0</Text>
      </View>
    </View>
  )
}
