// ============================================================
// 基础枚举和类型
// ============================================================

/** 游戏阶段 */
export type GamePhase = 'menu' | 'playing' | 'gameover';

/** 项目难度 */
export type Difficulty = 'easy' | 'normal' | 'hard';

/** 事件类别 */
export type EventCategory = 'dependency' | 'refactor' | 'deploy' | 'delete' | 'feature' | 'yolo';

/** 玩法风格（流派） */
export type PlayStyle = 'speed' | 'craft' | 'budget' | 'gambler';

/** 决策界面类型 */
export type DecisionType = 'permission' | 'emergency' | 'meeting' | 'review';

/** 风险等级 */
export type RiskLevel = 'low' | 'medium' | 'high' | 'extreme';

/** 结果等级（精简） */
export type OutcomeLevel =
  | 'success'        // 正面结果
  | 'minor_bug'      // 小问题
  | 'moderate'       // 中等问题
  | 'catastrophe'    // 灾难
  | 'safe'           // 安全/保守结果
  | 'quality_boost'; // 意外好结果

/** 评分等级 */
export type Grade = 'S' | 'A' | 'B' | 'C' | 'D' | 'F';

// ============================================================
// 里程碑系统
// ============================================================

/** 里程碑阶段 ID */
export type MilestoneId = 'init' | 'core' | 'crisis' | 'test' | 'launch';

/** 里程碑定义 */
export interface MilestoneDefinition {
  id: MilestoneId;
  name: string;                    // "项目启动"
  description: string;             // "搭环境、选技术栈"
  progressRange: [number, number]; // [0, 20] 表示 0%~20%
  /** 进入此阶段时的 Boss 事件 ID（第一个阶段无 Boss） */
  bossEventId?: string;
}

// ============================================================
// 持续效果系统
// ============================================================

/** 持续效果 ID（预定义的所有效果） */
export type EffectId =
  | 'tech_debt'           // 技术债累积
  | 'fragile_arch'        // 脆弱架构
  | 'budget_alert'        // 预算警报
  | 'overconfidence'      // 团队过度自信
  | 'low_morale'          // 士气低落
  | 'tech_credit';        // 技术信用（正面 buff）

/** 效果对游戏机制的修改器 */
export interface EffectModifier {
  /** 对特定类别事件的灾难概率加成（百分比） */
  catastropheBonus?: Partial<Record<EventCategory, number>>;
  /** 对所有正面结果概率的加成（负数为减少） */
  successBonus?: number;
  /** 锁定高成本选项（预算警报用） */
  lockHighCostChoices?: boolean;
  /** 额外可解锁的选项（技术信用用） */
  unlockBonusChoice?: boolean;
}

/** 持续效果定义（配表用） */
export interface EffectDefinition {
  id: EffectId;
  name: string;               // "技术债累积"
  icon: string;               // "🔧"
  description: string;        // 简短描述当前影响
  modifiers: EffectModifier;
  /** 自动消除条件描述（给玩家看） */
  clearHint: string;
}

/** 运行时的活跃效果实例 */
export interface ActiveEffect {
  id: EffectId;
  /** 触发时的游戏秒数（用于判断持续时长） */
  appliedAt: number;
  /** 叠加层数（部分效果可叠加） */
  stacks: number;
}

// ============================================================
// 事件系统（多选项）
// ============================================================

/** 数值效果 */
export interface StateEffects {
  progress?: number;
  codeQuality?: number;
  bugs?: number;
  apiCost?: number;
  systemHealth?: number;
}

/** 加权结果 */
export interface WeightedOutcome {
  weight: number;
  level: OutcomeLevel;
  effects: StateEffects;
  message: string;
  /** 触发的持续效果（可选） */
  applyEffect?: EffectId;
  /** 清除的持续效果（可选） */
  clearEffect?: EffectId;
}

/** 单个选项（取代旧的 Accept/Reject） */
export interface EventChoice {
  id: string;                  // "full_accept" / "partial" / "manual"
  label: string;               // "全盘接受" — 按钮文字，简短
  description: string;         // "快但高风险" — 一行说明 trade-off
  style: PlayStyle;            // 所属流派
  riskLevel: RiskLevel;        // 风险等级（用于 UI 颜色提示）
  outcomes: WeightedOutcome[];
  /** 是否需要特定效果才能解锁（技术信用等） */
  requiresEffect?: EffectId;
  /** 是否为高成本选项（预算警报时被锁定） */
  isHighCost?: boolean;
}

/** 游戏事件（新版） */
export interface GameEvent {
  id: string;
  title: string;               // 事件标题
  description: string;         // 讽刺描述
  icon: string;                // emoji
  category: EventCategory;
  /** 决策界面类型 */
  decisionType: DecisionType;
  /** 选项列表：通常 3 个，少数 Boss 事件 4 个 */
  choices: EventChoice[];
  /** 进度范围限制 */
  minProgress: number;
  maxProgress: number;
  /** 是否为 Boss 事件（阶段转换时强制触发） */
  isBoss?: boolean;
  /** 前置事件 ID — 只有玩过这些事件才会出现 */
  prerequisites?: string[];
  /** 需要的持续效果 — 只有存在该效果时才出现 */
  requiredEffects?: EffectId[];
  /** 项目专属 — 只在指定项目中出现（空/undefined = 通用） */
  projectIds?: string[];
}

// ============================================================
// 因果链
// ============================================================

/** 因果链定义：前置事件的某个选择 → 后续事件 */
export interface CausalLink {
  /** 触发源事件 ID */
  sourceEventId: string;
  /** 触发源选项 ID（玩家选了哪个才触发） */
  sourceChoiceId: string;
  /** 结果等级过滤（可选，比如只有灾难时才触发后续） */
  sourceOutcomeLevel?: OutcomeLevel;
  /** 后续事件 ID（此事件会加入候选池） */
  targetEventId: string;
  /** 延迟几个事件后才出现（0 = 下一个事件就可能出现） */
  minDelay: number;
}

// ============================================================
// 项目配置（增强版）
// ============================================================

/** 项目风险倾向 */
export interface ProjectRiskProfile {
  /** 各类别事件出现权重修正（1.0 = 标准，1.5 = 多 50%） */
  categoryWeights: Partial<Record<EventCategory, number>>;
  /** 推荐流派（展示用） */
  recommendedStyle: PlayStyle;
  /** 项目专属的阶段里程碑名称覆写 */
  milestoneNames?: Partial<Record<MilestoneId, string>>;
}

/** 项目配置 */
export interface ProjectConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  features: string[];
  difficulty: Difficulty;
  /** 项目专属风险倾向 */
  riskProfile: ProjectRiskProfile;
}

// ============================================================
// 游戏状态
// ============================================================

/** 流派统计 */
export interface StyleStats {
  speed: number;
  craft: number;
  budget: number;
  gambler: number;
}

/** 事件结果记录 */
export interface EventResult {
  eventId: string;
  choiceId: string;             // 玩家选择的选项 ID
  choiceStyle: PlayStyle;       // 该选项的流派
  outcome: WeightedOutcome;
  timestamp: number;            // 游戏秒数
}

/** 核心游戏状态 */
export interface GameState {
  phase: GamePhase;
  project: ProjectConfig | null;

  // 五大指标
  progress: number;             // 0-100
  codeQuality: number;          // 0-100, 初始 70
  bugs: number;                 // 从 0 开始
  apiCost: number;              // 美元，从 0 开始
  systemHealth: number;         // 0-100, 初始 100

  // 里程碑
  currentMilestone: MilestoneId;
  milestonesCompleted: MilestoneId[];

  // 持续效果
  activeEffects: ActiveEffect[];

  // 流派追踪
  styleStats: StyleStats;
  /** 已确认的主要流派（连续 3 次同风格后确认） */
  confirmedStyle: PlayStyle | null;

  // 游戏进程
  elapsedSeconds: number;
  currentActivity: string;
  eventsCompleted: number;
  eventHistory: EventResult[];

  // 因果链追踪
  /** 已触发的因果链 targetEventId 列表（加入候选池） */
  unlockedCausalEvents: string[];

  // 弹窗状态
  activePrompt: GameEvent | null;
  promptVisible: boolean;

  // 结果反馈
  lastOutcomeMessage: string | null;
  lastOutcomeLevel: OutcomeLevel | null;

  // 结算
  finalScore: FinalScore | null;
  gameEndReason: 'completed' | 'crashed' | null;
}

// ============================================================
// Reducer Actions
// ============================================================

export type GameAction =
  | { type: 'START_GAME'; project: ProjectConfig }
  | { type: 'TICK' }
  | { type: 'SHOW_PROMPT'; event: GameEvent }
  | { type: 'MAKE_CHOICE'; choiceId: string; choice: EventChoice }
  | { type: 'APPLY_OUTCOME'; outcome: WeightedOutcome; choiceId: string; style: PlayStyle }
  | { type: 'APPLY_EFFECT'; effectId: EffectId }
  | { type: 'CLEAR_EFFECT'; effectId: EffectId }
  | { type: 'ADVANCE_MILESTONE'; milestone: MilestoneId }
  | { type: 'UNLOCK_CAUSAL_EVENT'; eventId: string }
  | { type: 'CLEAR_OUTCOME_MESSAGE' }
  | { type: 'UPDATE_ACTIVITY'; activity: string }
  | { type: 'END_GAME'; reason: 'completed' | 'crashed' }
  | { type: 'SET_SCORE'; score: FinalScore }
  | { type: 'RESET' };

// ============================================================
// 评分系统
// ============================================================

export interface ScoreBreakdown {
  completionScore: number;     // 0-400
  qualityScore: number;        // 0-250
  efficiencyScore: number;     // 0-200
  stabilityScore: number;      // 0-150
}

export interface FinalScore {
  totalPoints: number;
  grade: Grade;
  title: string;
  breakdown: ScoreBreakdown;
  /** 本局主要玩法风格 */
  dominantStyle: PlayStyle | null;
  /** 触发过的因果链数量 */
  causalChainsTriggered: number;
}
