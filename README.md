# Vibe Coding Simulator (氛围编程模拟器)

[English](./README_EN.md)

一款讽刺性浏览器小游戏，模拟 "Vibe Coding" 体验 — AI 自动写代码，你只需要做决策。

## 游戏概览

玩家选择一个项目，AI 开始自动"写代码"。每隔几秒会弹出一个决策点，提供 3 个选项，代表不同策略方向（速度型 / 工匠型 / 预算型 / 赌徒型）。进度达到 100% 即为胜利，系统健康值降为 0 则崩溃失败。

## 核心特性

- **5 项核心指标** — 进度、代码质量、Bug 数、API 花费、系统健康值
- **里程碑系统** — 5 个阶段，每阶段结束有 Boss 事件
- **持续效果系统** — Buff / Debuff 会持续影响后续决策结果
- **因果链系统** — 早期决策会触发后续连锁事件
- **玩法风格系统** — 根据选择确认你的编程风格
- **4 种决策 UI** — 终端内联、紧急警报、NPC 会议、代码审查

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Taro 4 (React + TypeScript) |
| 样式 | Tailwind CSS 3 + weapp-tailwindcss |
| 动画 | CSS @keyframes + transitions |
| 状态 | useReducer + React Context |
| 平台 | H5 / 微信小程序 |

## 快速开始

```bash
# 安装依赖
pnpm install

# H5 开发服务器
pnpm run dev:h5

# 生产构建
pnpm run build:h5
```

## 评分系统

总分 1000 分，由 4 个维度组成：

| 维度 | 满分 |
|------|------|
| 完成度 | 400 |
| 代码质量 | 250 |
| 效率 | 200 |
| 稳定性 | 150 |

等级：S / A / B / C / D / F

## 许可证

[GPL-3.0](./LICENSE)
