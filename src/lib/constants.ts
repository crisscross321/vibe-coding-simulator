// ============================================================
// 游戏常量 — 所有可调节参数集中在此
// ============================================================

import type { MilestoneId } from '@/types'

export const GAME_CONSTANTS = {
  // ===== 初始值 =====
  INITIAL_CODE_QUALITY: 70,
  INITIAL_SYSTEM_HEALTH: 100,

  // ===== 空闲进度（每秒） =====
  // 降低被动进度，让玩家决策成为推进主力
  IDLE_PROGRESS_PER_SECOND: 0.10,    // 旧值 0.25 → 新值 0.10
  IDLE_API_COST_PER_SECOND: 0.08,    // 旧值 0.12 → 新值 0.08

  // ===== 弹窗间隔（毫秒） =====
  // 缩短等待时间，让节奏更紧凑
  MIN_PROMPT_DELAY: 2500,            // 旧值 4000 → 新值 2500
  MAX_PROMPT_DELAY: 5000,            // 旧值 9000 → 新值 5000

  // ===== 总轮次控制 =====
  /** 一局游戏的目标决策轮数（不含 Boss） */
  TARGET_ROUNDS: 10,
  /** Boss 事件数量（阶段 2-5 各一个，阶段 1 无 Boss） */
  BOSS_COUNT: 4,
  /** 一局游戏目标总时长约 60~90 秒 */

  // ===== 结束条件 =====
  WIN_PROGRESS: 100,
  LOSE_HEALTH: 0,

  // ===== 代码动画 =====
  CODE_CHAR_DELAY_MIN: 20,
  CODE_CHAR_DELAY_MAX: 60,
  CODE_MAX_VISIBLE_LINES: 30,

  // ===== 结果消息显示时长 =====
  OUTCOME_MESSAGE_DURATION: 1800,    // 旧值 2000 → 新值 1800（配合节奏加快）

  // ===== 里程碑进度分界 =====
  MILESTONE_THRESHOLDS: {
    init: [0, 20],
    core: [20, 45],
    crisis: [45, 65],
    test: [65, 85],
    launch: [85, 100],
  } as Record<MilestoneId, [number, number]>,

  // ===== 流派系统 =====
  /** 连续选择同流派 N 次后确认流派 */
  STYLE_CONFIRM_STREAK: 3,
  /** 流派确认后，该流派选项的正面结果概率加成（百分比） */
  STYLE_CONFIRM_BONUS: 8,

  // ===== 效果系统 =====
  /** 效果最大叠加层数 */
  MAX_EFFECT_STACKS: 3,

  // ===== 紧急事件倒计时 =====
  /** 紧急事件的限时秒数（超时自动选第一个选项） */
  EMERGENCY_TIMEOUT_SECONDS: 8,

  // ===== 成就相关阈值 =====
  ACHIEVEMENT_SPEED_THRESHOLD: 75,   // 速通大师：75 秒内通关
  ACHIEVEMENT_ZERO_BUG: 0,
  ACHIEVEMENT_LOW_COST: 10,          // 花费 < $10
} as const;
