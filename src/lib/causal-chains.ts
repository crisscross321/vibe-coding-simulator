import type { CausalLink } from '@/types'

/**
 * 因果链定义
 * 前置事件的某个选择 → 后续事件加入候选池
 * minDelay: 至少经过 N 个事件后才可能被选中
 */
export const CAUSAL_LINKS: CausalLink[] = [
  // ===== 链 1: 847 包全盘接受 → node_modules 磁盘爆满 =====
  {
    sourceEventId: 'dep-847-packages',
    sourceChoiceId: 'full_accept',
    targetEventId: 'chain-node-modules-explode',
    minDelay: 2,
  },

  // ===== 链 2: 删除所有测试 → 回归 bug 大爆发 =====
  {
    sourceEventId: 'del-all-tests',
    sourceChoiceId: 'delete_tests',
    targetEventId: 'chain-regression-storm',
    minDelay: 2,
  },

  // ===== 链 3: 提交 API Key → 密钥泄露事件 =====
  {
    sourceEventId: 'yolo-commit-keys',
    sourceChoiceId: 'commit_keys',
    targetEventId: 'chain-key-leaked',
    minDelay: 1,
  },

  // ===== 链 4: 去掉 TypeScript → 类型混乱崩溃 =====
  {
    sourceEventId: 'ref-remove-ts',
    sourceChoiceId: 'remove_types',
    targetEventId: 'chain-type-chaos',
    minDelay: 2,
  },

  // ===== 链 5: 未测试部署灾难 → 线上大面积故障 =====
  {
    sourceEventId: 'deploy-untested-prod',
    sourceChoiceId: 'yolo_deploy',
    sourceOutcomeLevel: 'catastrophe',
    targetEventId: 'chain-production-fire',
    minDelay: 1,
  },

  // ===== 链 6: 删除错误处理 → 白屏连环崩溃 =====
  {
    sourceEventId: 'del-error-handling',
    sourceChoiceId: 'remove_catches',
    targetEventId: 'chain-cascading-crash',
    minDelay: 2,
  },
]
