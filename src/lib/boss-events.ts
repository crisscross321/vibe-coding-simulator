import type { GameEvent } from '@/types'

/**
 * Boss 事件定义
 * 4 个 Boss 事件，对应阶段 2-5（core/crisis/test/launch）
 * Boss 事件进度贡献 10-15%，后果更极端
 */
export const BOSS_EVENTS: GameEvent[] = [
  // ===== 阶段 2 Boss: 核心开发 → 技术选型争论 =====
  {
    id: 'boss-tech-debate',
    title: '技术选型大战',
    description: '团队陷入激烈争论：用 AI 推荐的"创新方案"还是业界成熟方案？整个架构方向悬而未决。',
    icon: '⚔️',
    category: 'refactor',
    decisionType: 'meeting',
    isBoss: true,
    minProgress: 20,
    maxProgress: 45,
    choices: [
      {
        id: 'follow_ai',
        label: '听 AI 的',
        description: '采用 AI 推荐的新奇方案，快速推进但风险大',
        style: 'speed',
        riskLevel: 'high',
        outcomes: [
          { weight: 45, level: 'success', effects: { progress: 14, codeQuality: 3, apiCost: 5 }, message: 'AI 的方案居然真的好用！架构清晰、进度飞涨' },
          { weight: 30, level: 'minor_bug', effects: { progress: 10, bugs: 2, apiCost: 5 }, message: '方案能跑但有些边界情况没覆盖' },
          { weight: 18, level: 'moderate', effects: { progress: 6, bugs: 3, systemHealth: -10, apiCost: 8 }, message: '新方案文档太少，很多坑要自己趟' },
          { weight: 7, level: 'catastrophe', effects: { progress: 3, bugs: 5, systemHealth: -20, apiCost: 10 }, message: 'AI 的方案根本跑不通，两天白费了', applyEffect: 'tech_debt' },
        ],
      },
      {
        id: 'mature_stack',
        label: '选成熟方案',
        description: '使用业界验证过的技术栈，稳定但缺乏亮点',
        style: 'craft',
        riskLevel: 'low',
        outcomes: [
          { weight: 60, level: 'success', effects: { progress: 10, codeQuality: 5, apiCost: 2 }, message: '成熟方案虽然无聊，但稳如老狗' },
          { weight: 30, level: 'safe', effects: { progress: 8, codeQuality: 3, apiCost: 2 }, message: '中规中矩，没惊喜也没惊吓' },
          { weight: 10, level: 'quality_boost', effects: { progress: 12, codeQuality: 8, apiCost: 2 }, message: '最佳实践加持，代码质量和进度都不错！', applyEffect: 'tech_credit' },
        ],
      },
      {
        id: 'hybrid_approach',
        label: '各取所长',
        description: '核心用成熟方案，非关键模块让 AI 自由发挥',
        style: 'budget',
        riskLevel: 'medium',
        outcomes: [
          { weight: 50, level: 'success', effects: { progress: 12, codeQuality: 3, apiCost: 4 }, message: '混合方案意外地平衡！核心稳、边缘快' },
          { weight: 30, level: 'minor_bug', effects: { progress: 9, bugs: 1, apiCost: 4 }, message: '两套方案的接口处偶尔有小摩擦' },
          { weight: 15, level: 'moderate', effects: { progress: 6, bugs: 3, codeQuality: -3, apiCost: 6 }, message: '架构分裂！两套风格的代码完全不兼容' },
          { weight: 5, level: 'catastrophe', effects: { progress: 3, bugs: 4, systemHealth: -12, apiCost: 8 }, message: '混搭变成了四不像，技术债堆积成山', applyEffect: 'tech_debt' },
        ],
      },
      {
        id: 'start_over',
        label: '推倒重来',
        description: '花时间调研后从零设计架构（需要技术信用）',
        style: 'craft',
        riskLevel: 'medium',
        requiresEffect: 'tech_credit',
        outcomes: [
          { weight: 55, level: 'quality_boost', effects: { progress: 8, codeQuality: 10, systemHealth: 5, apiCost: 3 }, message: '深思熟虑的架构设计让后续开发事半功倍！', clearEffect: 'tech_debt' },
          { weight: 35, level: 'success', effects: { progress: 10, codeQuality: 6, apiCost: 3 }, message: '重新设计花了时间但值得，代码干净整洁' },
          { weight: 10, level: 'minor_bug', effects: { progress: 6, codeQuality: 4, apiCost: 4 }, message: '过度设计了一些，部分模块有点臃肿' },
        ],
      },
    ],
  },

  // ===== 阶段 3 Boss: 需求变更 → 产品经理紧急会议 =====
  {
    id: 'boss-pm-meeting',
    title: '产品经理紧急会议',
    description: '距离 Demo Day 还有 3 天，产品经理突然要求加一个"AI 语音助手"功能。所有人都在看你。',
    icon: '📢',
    category: 'feature',
    decisionType: 'meeting',
    isBoss: true,
    minProgress: 45,
    maxProgress: 65,
    choices: [
      {
        id: 'accept_all',
        label: '全力肝上',
        description: '通宵加班硬刚新需求，进度快但系统稳定性堪忧',
        style: 'speed',
        riskLevel: 'high',
        outcomes: [
          { weight: 40, level: 'success', effects: { progress: 15, codeQuality: -5, systemHealth: -10, apiCost: 6 }, message: '通宵三天硬是把功能做出来了！代码质量？先不管了' },
          { weight: 30, level: 'minor_bug', effects: { progress: 12, bugs: 3, codeQuality: -8, systemHealth: -15, apiCost: 6 }, message: '功能勉强可用，但到处都是临时代码' },
          { weight: 20, level: 'moderate', effects: { progress: 8, bugs: 5, codeQuality: -12, systemHealth: -20, apiCost: 8 }, message: '赶工赶出了一堆 bug，系统变得极不稳定', applyEffect: 'fragile_arch' },
          { weight: 10, level: 'catastrophe', effects: { progress: 4, bugs: 7, systemHealth: -30, apiCost: 10 }, message: '通宵写的代码把整个系统搞崩了，不如不加', applyEffect: 'low_morale' },
        ],
        isHighCost: true,
      },
      {
        id: 'negotiate',
        label: '谈判砍需求',
        description: '说服 PM 把功能拆分，本期只做核心部分',
        style: 'craft',
        riskLevel: 'low',
        outcomes: [
          { weight: 50, level: 'success', effects: { progress: 10, codeQuality: 2, apiCost: 3 }, message: '成功砍到只做语音转文字，PM 勉强接受' },
          { weight: 30, level: 'safe', effects: { progress: 8, apiCost: 2 }, message: 'PM 不太高兴但同意了，后续可能还会加压' },
          { weight: 15, level: 'minor_bug', effects: { progress: 6, bugs: 1, apiCost: 3 }, message: '砍需求后做起来轻松多了，就是 PM 脸色不好看' },
          { weight: 5, level: 'quality_boost', effects: { progress: 12, codeQuality: 5, apiCost: 2 }, message: '精简需求后反而做出了更精致的功能！PM 竖起大拇指' },
        ],
      },
      {
        id: 'fake_it',
        label: '做个假 Demo',
        description: '表面上做出来，实际写死数据糊弄过去',
        style: 'gambler',
        riskLevel: 'extreme',
        outcomes: [
          { weight: 35, level: 'success', effects: { progress: 13, codeQuality: -8, apiCost: 2 }, message: '假 Demo 居然骗过了所有人！但这笔技术债...' , applyEffect: 'tech_debt' },
          { weight: 30, level: 'minor_bug', effects: { progress: 10, codeQuality: -5, apiCost: 2 }, message: '大部分人没看出来，但有个测试同学在追问' },
          { weight: 20, level: 'moderate', effects: { progress: 5, bugs: 2, codeQuality: -10, systemHealth: -8, apiCost: 3 }, message: '演示的时候出了 bug，大家发现是假的...' },
          { weight: 15, level: 'catastrophe', effects: { progress: 2, bugs: 4, codeQuality: -15, systemHealth: -15, apiCost: 4 }, message: 'CTO 当场识破假 Demo，信誉扫地', applyEffect: 'low_morale' },
        ],
      },
      {
        id: 'defer_with_plan',
        label: '拿出方案拒',
        description: '用数据说话，提出下版本实现计划（需要技术信用）',
        style: 'craft',
        riskLevel: 'low',
        requiresEffect: 'tech_credit',
        outcomes: [
          { weight: 60, level: 'quality_boost', effects: { progress: 10, codeQuality: 5, systemHealth: 5, apiCost: 1 }, message: '有理有据的拒绝！PM 认可了分期方案，团队松了口气' },
          { weight: 30, level: 'success', effects: { progress: 8, codeQuality: 3, apiCost: 2 }, message: '方案被接受，团队保住了开发节奏' },
          { weight: 10, level: 'safe', effects: { progress: 6, apiCost: 1 }, message: 'PM 虽然不太满意，但没话说。留了个小坑' },
        ],
      },
    ],
  },

  // ===== 阶段 4 Boss: 测试上线 → CTO 代码审查 =====
  {
    id: 'boss-cto-review',
    title: 'CTO 代码审查',
    description: 'CTO 亲自检查代码准备上线，发现了一堆问题。是修、是糊弄、还是争辩？',
    icon: '🔍',
    category: 'refactor',
    decisionType: 'review',
    isBoss: true,
    minProgress: 65,
    maxProgress: 85,
    choices: [
      {
        id: 'fix_all',
        label: '全部修复',
        description: '一条条修 CTO 指出的问题，质量提升但耗时',
        style: 'craft',
        riskLevel: 'low',
        outcomes: [
          { weight: 55, level: 'quality_boost', effects: { progress: 8, codeQuality: 10, bugs: -2, systemHealth: 5, apiCost: 3 }, message: '花了时间但代码焕然一新，CTO 非常满意', clearEffect: 'tech_debt' },
          { weight: 35, level: 'success', effects: { progress: 10, codeQuality: 6, bugs: -1, apiCost: 3 }, message: '大部分问题修好了，质量明显提升' },
          { weight: 10, level: 'minor_bug', effects: { progress: 6, codeQuality: 3, apiCost: 4 }, message: '修复过程中又引入了新问题，但总体好转' },
        ],
      },
      {
        id: 'fix_critical_only',
        label: '只修关键的',
        description: '只修高危问题，低优先级的记 TODO',
        style: 'budget',
        riskLevel: 'medium',
        outcomes: [
          { weight: 50, level: 'success', effects: { progress: 12, codeQuality: 3, bugs: -1, apiCost: 2 }, message: '关键问题修好了，其他的... 下个版本再说' },
          { weight: 30, level: 'minor_bug', effects: { progress: 10, bugs: 1, apiCost: 2 }, message: '有一个"低优先级"问题其实比想象中严重', applyEffect: 'tech_debt' },
          { weight: 15, level: 'moderate', effects: { progress: 7, bugs: 3, codeQuality: -3, systemHealth: -5, apiCost: 3 }, message: 'CTO 发现你跳过了几个重要问题，不太高兴' },
          { weight: 5, level: 'catastrophe', effects: { progress: 4, bugs: 5, systemHealth: -15, apiCost: 4 }, message: '被跳过的"低优先级"问题在生产环境爆了', applyEffect: 'fragile_arch' },
        ],
      },
      {
        id: 'argue_back',
        label: '据理力争',
        description: '逐条反驳 CTO 的建议，坚持现有方案',
        style: 'gambler',
        riskLevel: 'high',
        outcomes: [
          { weight: 30, level: 'success', effects: { progress: 13, codeQuality: 2, apiCost: 1 }, message: '居然说服了 CTO！他承认部分建议过于学院派' },
          { weight: 25, level: 'minor_bug', effects: { progress: 10, apiCost: 1 }, message: 'CTO 让步了一半，另一半坚持要改' },
          { weight: 30, level: 'moderate', effects: { progress: 6, codeQuality: -5, systemHealth: -5, apiCost: 2 }, message: 'CTO 火了，要求全面重审代码', applyEffect: 'low_morale' },
          { weight: 15, level: 'catastrophe', effects: { progress: 3, codeQuality: -8, systemHealth: -10, apiCost: 3 }, message: 'CTO 当场打回整个提交，要求从头来过' },
        ],
      },
      {
        id: 'auto_fix',
        label: '让 AI 修',
        description: '把 CTO 的审查意见喂给 AI，让它自动修复',
        style: 'speed',
        riskLevel: 'high',
        isHighCost: true,
        outcomes: [
          { weight: 35, level: 'success', effects: { progress: 13, codeQuality: 4, apiCost: 6 }, message: 'AI 修复效率惊人，大部分问题完美解决' },
          { weight: 30, level: 'minor_bug', effects: { progress: 10, bugs: 2, codeQuality: 1, apiCost: 6 }, message: 'AI 修了旧问题又引入了新问题，净效果一般' },
          { weight: 25, level: 'moderate', effects: { progress: 7, bugs: 3, codeQuality: -3, apiCost: 8 }, message: 'AI 的修复方案和项目风格完全不搭，CTO 更生气了' },
          { weight: 10, level: 'catastrophe', effects: { progress: 4, bugs: 5, codeQuality: -8, systemHealth: -12, apiCost: 10 }, message: 'AI 自作主张重构了半个项目，代码面目全非' },
        ],
      },
    ],
  },

  // ===== 阶段 5 Boss: 最终交付 → Demo Day =====
  {
    id: 'boss-demo-day',
    title: 'Demo Day 来了',
    description: '投资人/老板/全公司都在看。服务器能顶住吗？功能能正常跑吗？你的选择决定最终结局。',
    icon: '🎬',
    category: 'deploy',
    decisionType: 'emergency',
    isBoss: true,
    minProgress: 85,
    maxProgress: 100,
    choices: [
      {
        id: 'full_demo',
        label: '完整演示',
        description: '展示所有功能，高光时刻或当场翻车',
        style: 'gambler',
        riskLevel: 'high',
        outcomes: [
          { weight: 40, level: 'success', effects: { progress: 15, codeQuality: 3, systemHealth: 5 }, message: '完美演示！全场起立鼓掌，项目大获成功！' },
          { weight: 25, level: 'minor_bug', effects: { progress: 12, bugs: 1 }, message: '中途有个小 bug，但你机智地跳过了，整体还行' },
          { weight: 20, level: 'moderate', effects: { progress: 8, bugs: 3, systemHealth: -10 }, message: '演示到一半页面白屏了... 尴尬地重启后继续' },
          { weight: 15, level: 'catastrophe', effects: { progress: 5, bugs: 5, systemHealth: -25 }, message: '现场演示全面翻车，数据库连不上、页面崩溃、老板黑脸' },
        ],
      },
      {
        id: 'safe_demo',
        label: '保守演示',
        description: '只展示最稳定的 60% 功能，降低翻车风险',
        style: 'craft',
        riskLevel: 'low',
        outcomes: [
          { weight: 55, level: 'success', effects: { progress: 12, codeQuality: 2, systemHealth: 3 }, message: '稳定演示，虽然没有 Wow 时刻但零事故' },
          { weight: 30, level: 'safe', effects: { progress: 10, systemHealth: 2 }, message: '平平无奇的演示，老板觉得还行' },
          { weight: 10, level: 'quality_boost', effects: { progress: 13, codeQuality: 5, systemHealth: 5 }, message: '少即是多！精简的演示反而让核心功能更突出' },
          { weight: 5, level: 'minor_bug', effects: { progress: 8, bugs: 1 }, message: '保守方案里唯一展示的功能出了个小意外...' },
        ],
      },
      {
        id: 'pre_recorded',
        label: '录屏替代',
        description: '用提前录好的视频演示，万无一失但可能被发现',
        style: 'budget',
        riskLevel: 'medium',
        outcomes: [
          { weight: 45, level: 'success', effects: { progress: 11, apiCost: 1 }, message: '录屏完美播放，没人发现不是实时的' },
          { weight: 25, level: 'safe', effects: { progress: 9, apiCost: 1 }, message: '有人问"能不能现场操作一下？"你巧妙地转移了话题' },
          { weight: 20, level: 'moderate', effects: { progress: 6, codeQuality: -5, systemHealth: -5, apiCost: 1 }, message: '有人注意到鼠标移动的时间戳和现在不一样... 尴尬' },
          { weight: 10, level: 'catastrophe', effects: { progress: 3, codeQuality: -10, systemHealth: -15, apiCost: 2 }, message: '录屏播放时弹出了一个系统通知暴露了真相，信誉归零' },
        ],
      },
      {
        id: 'live_fix',
        label: '现场调试',
        description: '直接打开代码编辑器，现场修 bug 给大家看（需要技术信用）',
        style: 'gambler',
        riskLevel: 'extreme',
        requiresEffect: 'tech_credit',
        outcomes: [
          { weight: 40, level: 'quality_boost', effects: { progress: 15, codeQuality: 8, systemHealth: 5 }, message: '现场 live coding 修 bug，全场惊呼！这就是真正的 10x 工程师！' },
          { weight: 30, level: 'success', effects: { progress: 13, codeQuality: 4 }, message: '虽然手有点抖但成功修复了，技术实力有目共睹' },
          { weight: 20, level: 'minor_bug', effects: { progress: 10, bugs: 1, codeQuality: 2 }, message: '修好了一个 bug 但冒出了另一个... 不过大家觉得很真实' },
          { weight: 10, level: 'moderate', effects: { progress: 7, bugs: 2, systemHealth: -8 }, message: '现场调试失败，场面一度非常尴尬' },
        ],
      },
    ],
  },
]
