import type { MilestoneDefinition } from '@/types'

/**
 * 里程碑定义
 * 5 个阶段，阶段 2-5 各有一个 Boss 事件
 */
export const MILESTONES: MilestoneDefinition[] = [
  {
    id: 'init',
    name: '项目启动',
    description: '搭环境、选技术栈、装依赖，一切从零开始',
    progressRange: [0, 20],
    // 第一阶段无 Boss
  },
  {
    id: 'core',
    name: '核心开发',
    description: '实现主要功能，技术债开始暗中积累',
    progressRange: [20, 45],
    bossEventId: 'boss-tech-debate',
  },
  {
    id: 'crisis',
    name: '需求变更',
    description: '老板/甲方突然改需求，一切推倒重来？',
    progressRange: [45, 65],
    bossEventId: 'boss-pm-meeting',
  },
  {
    id: 'test',
    name: '测试上线',
    description: 'Bug 集中爆发，部署风险极高',
    progressRange: [65, 85],
    bossEventId: 'boss-cto-review',
  },
  {
    id: 'launch',
    name: '最终交付',
    description: 'Demo Day / 上线首日，成败在此一举',
    progressRange: [85, 100],
    bossEventId: 'boss-demo-day',
  },
]
