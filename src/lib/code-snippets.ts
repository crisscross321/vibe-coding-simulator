export type TokenType = 'keyword' | 'string' | 'comment' | 'function' | 'number' | 'variable' | 'operator' | 'plain'

export interface CodeLine {
  tokens: { text: string; type: TokenType }[]
}

export interface CodeSnippet {
  lines: CodeLine[]
}

function t(text: string, type: TokenType) {
  return { text, type }
}

const SNIPPET_SETUP: CodeSnippet = {
  lines: [
    { tokens: [t('import', 'keyword'), t(' { createApp } ', 'plain'), t('from', 'keyword'), t(" 'vue'", 'string')] },
    { tokens: [t('import', 'keyword'), t(' { configureStore } ', 'plain'), t('from', 'keyword'), t(" '@reduxjs/toolkit'", 'string')] },
    { tokens: [t('import', 'keyword'), t(' express ', 'plain'), t('from', 'keyword'), t(" 'express'", 'string')] },
    { tokens: [t('', 'plain')] },
    { tokens: [t('// Initialize application config', 'comment')] },
    { tokens: [t('const', 'keyword'), t(' config', 'variable'), t(' = ', 'operator'), t('{', 'plain')] },
    { tokens: [t('  port', 'variable'), t(': ', 'operator'), t('3000', 'number'), t(',', 'plain')] },
    { tokens: [t('  env', 'variable'), t(': ', 'operator'), t("process.env.NODE_ENV", 'variable'), t(' || ', 'operator'), t("'development'", 'string'), t(',', 'plain')] },
    { tokens: [t('  database', 'variable'), t(': ', 'operator'), t('{', 'plain')] },
    { tokens: [t('    host', 'variable'), t(': ', 'operator'), t("'localhost'", 'string'), t(',', 'plain')] },
    { tokens: [t('    port', 'variable'), t(': ', 'operator'), t('5432', 'number'), t(',', 'plain')] },
    { tokens: [t('    name', 'variable'), t(': ', 'operator'), t("'vibe_coding_db'", 'string')] },
    { tokens: [t('  }', 'plain'), t(',', 'plain')] },
    { tokens: [t('  redis', 'variable'), t(': ', 'operator'), t('{', 'plain')] },
    { tokens: [t('    url', 'variable'), t(': ', 'operator'), t("'redis://127.0.0.1:6379'", 'string')] },
    { tokens: [t('  }', 'plain')] },
    { tokens: [t('}', 'plain')] },
    { tokens: [t('', 'plain')] },
    { tokens: [t('export', 'keyword'), t(' default', 'keyword'), t(' config', 'variable')] },
  ],
}

const SNIPPET_AUTH: CodeSnippet = {
  lines: [
    { tokens: [t('import', 'keyword'), t(' jwt ', 'plain'), t('from', 'keyword'), t(" 'jsonwebtoken'", 'string')] },
    { tokens: [t('import', 'keyword'), t(' bcrypt ', 'plain'), t('from', 'keyword'), t(" 'bcryptjs'", 'string')] },
    { tokens: [t('', 'plain')] },
    { tokens: [t('const', 'keyword'), t(' SECRET', 'variable'), t(' = ', 'operator'), t('process.env.JWT_SECRET', 'variable')] },
    { tokens: [t('', 'plain')] },
    { tokens: [t('async', 'keyword'), t(' function', 'keyword'), t(' authenticateUser', 'function'), t('(email, password) {', 'plain')] },
    { tokens: [t('  const', 'keyword'), t(' user', 'variable'), t(' = ', 'operator'), t('await', 'keyword'), t(' db.', 'plain'), t('findByEmail', 'function'), t('(email)', 'plain')] },
    { tokens: [t('  if', 'keyword'), t(' (!user) ', 'plain'), t('throw', 'keyword'), t(' new', 'keyword'), t(" Error('User not found')", 'plain')] },
    { tokens: [t('', 'plain')] },
    { tokens: [t('  const', 'keyword'), t(' isValid', 'variable'), t(' = ', 'operator'), t('await', 'keyword'), t(' bcrypt.', 'plain'), t('compare', 'function'), t('(password, user.hash)', 'plain')] },
    { tokens: [t('  if', 'keyword'), t(' (!isValid) ', 'plain'), t('throw', 'keyword'), t(' new', 'keyword'), t(" Error('Invalid password')", 'plain')] },
    { tokens: [t('', 'plain')] },
    { tokens: [t('  const', 'keyword'), t(' token', 'variable'), t(' = ', 'operator'), t('jwt.', 'plain'), t('sign', 'function'), t('(', 'plain')] },
    { tokens: [t('    { userId: user.id, role: user.role },', 'plain')] },
    { tokens: [t('    SECRET,', 'variable')] },
    { tokens: [t('    { expiresIn: ', 'plain'), t("'24h'", 'string'), t(' }', 'plain')] },
    { tokens: [t('  )', 'plain')] },
    { tokens: [t('  return', 'keyword'), t(' { token, user }', 'plain')] },
    { tokens: [t('}', 'plain')] },
  ],
}

const SNIPPET_API: CodeSnippet = {
  lines: [
    { tokens: [t('// RESTful API Routes', 'comment')] },
    { tokens: [t('const', 'keyword'), t(' router', 'variable'), t(' = ', 'operator'), t('express.', 'plain'), t('Router', 'function'), t('()', 'plain')] },
    { tokens: [t('', 'plain')] },
    { tokens: [t('router.', 'plain'), t('get', 'function'), t("('/api/items'", 'string'), t(', ', 'operator'), t('async', 'keyword'), t(' (req, res) ', 'plain'), t('=>', 'operator'), t(' {', 'plain')] },
    { tokens: [t('  const', 'keyword'), t(' { page, limit } ', 'plain'), t('= ', 'operator'), t('req.query', 'variable')] },
    { tokens: [t('  const', 'keyword'), t(' offset', 'variable'), t(' = ', 'operator'), t('(page ', 'plain'), t('-', 'operator'), t(' 1', 'number'), t(') ', 'plain'), t('*', 'operator'), t(' limit', 'variable')] },
    { tokens: [t('', 'plain')] },
    { tokens: [t('  const', 'keyword'), t(' items', 'variable'), t(' = ', 'operator'), t('await', 'keyword'), t(' prisma.item.', 'plain'), t('findMany', 'function'), t('({', 'plain')] },
    { tokens: [t('    skip: offset,', 'plain')] },
    { tokens: [t('    take: ', 'plain'), t('parseInt', 'function'), t('(limit),', 'plain')] },
    { tokens: [t('    orderBy: { createdAt: ', 'plain'), t("'desc'", 'string'), t(' }', 'plain')] },
    { tokens: [t('  })', 'plain')] },
    { tokens: [t('', 'plain')] },
    { tokens: [t('  res.', 'plain'), t('json', 'function'), t('({ data: items, total: items.length })', 'plain')] },
    { tokens: [t('})', 'plain')] },
    { tokens: [t('', 'plain')] },
    { tokens: [t('router.', 'plain'), t('post', 'function'), t("('/api/items'", 'string'), t(', ', 'operator'), t('validate', 'function'), t('(schema), ', 'plain'), t('async', 'keyword'), t(' (req, res) ', 'plain'), t('=>', 'operator'), t(' {', 'plain')] },
    { tokens: [t('  const', 'keyword'), t(' item', 'variable'), t(' = ', 'operator'), t('await', 'keyword'), t(' prisma.item.', 'plain'), t('create', 'function'), t('({ data: req.body })', 'plain')] },
    { tokens: [t('  res.', 'plain'), t('status', 'function'), t('(', 'plain'), t('201', 'number'), t(').', 'plain'), t('json', 'function'), t('({ data: item })', 'plain')] },
    { tokens: [t('})', 'plain')] },
  ],
}

const SNIPPET_DATABASE: CodeSnippet = {
  lines: [
    { tokens: [t('import', 'keyword'), t(' { PrismaClient } ', 'plain'), t('from', 'keyword'), t(" '@prisma/client'", 'string')] },
    { tokens: [t('', 'plain')] },
    { tokens: [t('const', 'keyword'), t(' prisma', 'variable'), t(' = ', 'operator'), t('new', 'keyword'), t(' PrismaClient', 'function'), t('()', 'plain')] },
    { tokens: [t('', 'plain')] },
    { tokens: [t('// Database migration: add indexes', 'comment')] },
    { tokens: [t('async', 'keyword'), t(' function', 'keyword'), t(' migrate', 'function'), t('() {', 'plain')] },
    { tokens: [t('  await', 'keyword'), t(' prisma.$', 'plain'), t('executeRaw', 'function'), t('`', 'string')] },
    { tokens: [t('    CREATE INDEX IF NOT EXISTS idx_items_user', 'string')] },
    { tokens: [t('    ON items(user_id, created_at DESC)', 'string')] },
    { tokens: [t('  `', 'string')] },
    { tokens: [t('', 'plain')] },
    { tokens: [t('  await', 'keyword'), t(' prisma.$', 'plain'), t('executeRaw', 'function'), t('`', 'string')] },
    { tokens: [t('    ALTER TABLE items', 'string')] },
    { tokens: [t('    ADD COLUMN IF NOT EXISTS metadata JSONB', 'string')] },
    { tokens: [t('    DEFAULT ', 'string'), t("'{}'", 'string'), t('::jsonb', 'string')] },
    { tokens: [t('  `', 'string')] },
    { tokens: [t('', 'plain')] },
    { tokens: [t('  console.', 'plain'), t('log', 'function'), t('(', 'plain'), t("'Migration complete!'", 'string'), t(')', 'plain')] },
    { tokens: [t('}', 'plain')] },
  ],
}

const SNIPPET_COMPONENT: CodeSnippet = {
  lines: [
    { tokens: [t('import', 'keyword'), t(' React, { useState, useEffect } ', 'plain'), t('from', 'keyword'), t(" 'react'", 'string')] },
    { tokens: [t('', 'plain')] },
    { tokens: [t('function', 'keyword'), t(' Dashboard', 'function'), t('({ userId }) {', 'plain')] },
    { tokens: [t('  const', 'keyword'), t(' [data, setData]', 'variable'), t(' = ', 'operator'), t('useState', 'function'), t('(', 'plain'), t('null', 'keyword'), t(')', 'plain')] },
    { tokens: [t('  const', 'keyword'), t(' [loading, setLoading]', 'variable'), t(' = ', 'operator'), t('useState', 'function'), t('(', 'plain'), t('true', 'keyword'), t(')', 'plain')] },
    { tokens: [t('', 'plain')] },
    { tokens: [t('  ', 'plain'), t('useEffect', 'function'), t('(() ', 'plain'), t('=>', 'operator'), t(' {', 'plain')] },
    { tokens: [t('    ', 'plain'), t('fetchData', 'function'), t('(userId)', 'plain')] },
    { tokens: [t('      .', 'plain'), t('then', 'function'), t('(res ', 'plain'), t('=>', 'operator'), t(' setData(res))', 'plain')] },
    { tokens: [t('      .', 'plain'), t('catch', 'function'), t('(err ', 'plain'), t('=>', 'operator'), t(' console.error(err))', 'plain')] },
    { tokens: [t('      .', 'plain'), t('finally', 'function'), t('(() ', 'plain'), t('=>', 'operator'), t(' setLoading(', 'plain'), t('false', 'keyword'), t('))', 'plain')] },
    { tokens: [t('  }, [userId])', 'plain')] },
    { tokens: [t('', 'plain')] },
    { tokens: [t('  if', 'keyword'), t(' (loading) ', 'plain'), t('return', 'keyword'), t(' <Spinner />', 'plain')] },
    { tokens: [t('', 'plain')] },
    { tokens: [t('  return', 'keyword'), t(' (', 'plain')] },
    { tokens: [t('    <div className=', 'plain'), t('"grid grid-cols-3 gap-4"', 'string'), t('>', 'plain')] },
    { tokens: [t('      {data.items.', 'plain'), t('map', 'function'), t('(item ', 'plain'), t('=>', 'operator'), t(' (', 'plain')] },
    { tokens: [t('        <Card key={item.id} title={item.name} />', 'plain')] },
    { tokens: [t('      ))}</div>)', 'plain')] },
    { tokens: [t('}', 'plain')] },
  ],
}

const SNIPPET_DEPLOY: CodeSnippet = {
  lines: [
    { tokens: [t('# Dockerfile', 'comment')] },
    { tokens: [t('FROM', 'keyword'), t(' node:', 'plain'), t('20', 'number'), t('-alpine ', 'plain'), t('AS', 'keyword'), t(' builder', 'variable')] },
    { tokens: [t('WORKDIR', 'keyword'), t(' /app', 'string')] },
    { tokens: [t('COPY', 'keyword'), t(' package*.json ./', 'string')] },
    { tokens: [t('RUN', 'keyword'), t(' npm ci ', 'plain'), t('--production', 'variable')] },
    { tokens: [t('COPY', 'keyword'), t(' . .', 'string')] },
    { tokens: [t('RUN', 'keyword'), t(' npm run build', 'plain')] },
    { tokens: [t('', 'plain')] },
    { tokens: [t('FROM', 'keyword'), t(' nginx:', 'plain'), t('1.25', 'number'), t('-alpine', 'plain')] },
    { tokens: [t('COPY', 'keyword'), t(' --from=builder /app/dist /usr/share/nginx/html', 'string')] },
    { tokens: [t('COPY', 'keyword'), t(' nginx.conf /etc/nginx/conf.d/default.conf', 'string')] },
    { tokens: [t('', 'plain')] },
    { tokens: [t('EXPOSE', 'keyword'), t(' ', 'plain'), t('80', 'number')] },
    { tokens: [t('HEALTHCHECK', 'keyword'), t(' --interval=', 'plain'), t('30', 'number'), t('s ', 'plain'), t('CMD', 'keyword'), t(' curl -f http://localhost/', 'string')] },
    { tokens: [t('CMD', 'keyword'), t(' ["nginx", "-g", "daemon off;"]', 'string')] },
    { tokens: [t('', 'plain')] },
    { tokens: [t('# docker-compose.yml excerpt', 'comment')] },
    { tokens: [t('services:', 'keyword')] },
    { tokens: [t('  app:', 'variable')] },
    { tokens: [t('    build: .', 'string')] },
    { tokens: [t('    ports: [', 'plain'), t('"80:80"', 'string'), t(']', 'plain')] },
  ],
}

const SNIPPET_TESTING: CodeSnippet = {
  lines: [
    { tokens: [t('import', 'keyword'), t(' { describe, it, expect } ', 'plain'), t('from', 'keyword'), t(" 'vitest'", 'string')] },
    { tokens: [t('import', 'keyword'), t(' { render, screen } ', 'plain'), t('from', 'keyword'), t(" '@testing-library/react'", 'string')] },
    { tokens: [t('', 'plain')] },
    { tokens: [t('describe', 'function'), t('(', 'plain'), t("'UserService'", 'string'), t(', () ', 'plain'), t('=>', 'operator'), t(' {', 'plain')] },
    { tokens: [t('  ', 'plain'), t('it', 'function'), t('(', 'plain'), t("'should create user with valid data'", 'string'), t(', ', 'plain'), t('async', 'keyword'), t(' () ', 'plain'), t('=>', 'operator'), t(' {', 'plain')] },
    { tokens: [t('    const', 'keyword'), t(' user', 'variable'), t(' = ', 'operator'), t('await', 'keyword'), t(' createUser', 'function'), t('({', 'plain')] },
    { tokens: [t('      email: ', 'plain'), t("'test@example.com'", 'string'), t(',', 'plain')] },
    { tokens: [t('      name: ', 'plain'), t("'Test User'", 'string')] },
    { tokens: [t('    })', 'plain')] },
    { tokens: [t('', 'plain')] },
    { tokens: [t('    ', 'plain'), t('expect', 'function'), t('(user.id).', 'plain'), t('toBeDefined', 'function'), t('()', 'plain')] },
    { tokens: [t('    ', 'plain'), t('expect', 'function'), t('(user.email).', 'plain'), t('toBe', 'function'), t('(', 'plain'), t("'test@example.com'", 'string'), t(')', 'plain')] },
    { tokens: [t('  })', 'plain')] },
    { tokens: [t('', 'plain')] },
    { tokens: [t('  ', 'plain'), t('it', 'function'), t('(', 'plain'), t("'should reject duplicate emails'", 'string'), t(', ', 'plain'), t('async', 'keyword'), t(' () ', 'plain'), t('=>', 'operator'), t(' {', 'plain')] },
    { tokens: [t('    await', 'keyword'), t(' ', 'plain'), t('expect', 'function'), t('(', 'plain')] },
    { tokens: [t('      ', 'plain'), t('createUser', 'function'), t("({ email: 'dup@test.com' })", 'plain')] },
    { tokens: [t('    ).rejects.', 'plain'), t('toThrow', 'function'), t('(', 'plain'), t("'already exists'", 'string'), t(')', 'plain')] },
    { tokens: [t('  })', 'plain')] },
    { tokens: [t('})', 'plain')] },
  ],
}

const SNIPPET_AI: CodeSnippet = {
  lines: [
    { tokens: [t('import', 'keyword'), t(' Anthropic ', 'plain'), t('from', 'keyword'), t(" '@anthropic-ai/sdk'", 'string')] },
    { tokens: [t('', 'plain')] },
    { tokens: [t('const', 'keyword'), t(' client', 'variable'), t(' = ', 'operator'), t('new', 'keyword'), t(' Anthropic', 'function'), t('()', 'plain')] },
    { tokens: [t('', 'plain')] },
    { tokens: [t('async', 'keyword'), t(' function', 'keyword'), t(' analyzeCode', 'function'), t('(sourceCode) {', 'plain')] },
    { tokens: [t('  const', 'keyword'), t(' message', 'variable'), t(' = ', 'operator'), t('await', 'keyword'), t(' client.messages.', 'plain'), t('create', 'function'), t('({', 'plain')] },
    { tokens: [t('    model: ', 'plain'), t("'claude-sonnet-4-20250514'", 'string'), t(',', 'plain')] },
    { tokens: [t('    max_tokens: ', 'plain'), t('1024', 'number'), t(',', 'plain')] },
    { tokens: [t('    messages: [{', 'plain')] },
    { tokens: [t('      role: ', 'plain'), t("'user'", 'string'), t(',', 'plain')] },
    { tokens: [t('      content: ', 'plain'), t('`Review this code:\\n${sourceCode}`', 'string')] },
    { tokens: [t('    }]', 'plain')] },
    { tokens: [t('  })', 'plain')] },
    { tokens: [t('', 'plain')] },
    { tokens: [t('  const', 'keyword'), t(' analysis', 'variable'), t(' = ', 'operator'), t('message.content[', 'plain'), t('0', 'number'), t('].text', 'plain')] },
    { tokens: [t('  const', 'keyword'), t(' score', 'variable'), t(' = ', 'operator'), t('parseQualityScore', 'function'), t('(analysis)', 'plain')] },
    { tokens: [t('', 'plain')] },
    { tokens: [t('  return', 'keyword'), t(' { analysis, score, tokens: message.usage }', 'plain')] },
    { tokens: [t('}', 'plain')] },
  ],
}

const ALL_SNIPPETS: CodeSnippet[] = [
  SNIPPET_SETUP,
  SNIPPET_AUTH,
  SNIPPET_API,
  SNIPPET_DATABASE,
  SNIPPET_COMPONENT,
  SNIPPET_DEPLOY,
  SNIPPET_TESTING,
  SNIPPET_AI,
]

/**
 * 根据进度返回合适阶段的代码片段
 */
export function getSnippetForProgress(progress: number): CodeSnippet {
  if (progress < 15) return SNIPPET_SETUP
  if (progress < 30) return SNIPPET_AUTH
  if (progress < 45) return SNIPPET_API
  if (progress < 60) return SNIPPET_DATABASE
  if (progress < 70) return SNIPPET_COMPONENT
  if (progress < 80) return SNIPPET_DEPLOY
  if (progress < 90) return SNIPPET_TESTING
  return SNIPPET_AI
}

/**
 * 获取一个随机的代码片段
 */
export function getRandomSnippet(): CodeSnippet {
  return ALL_SNIPPETS[Math.floor(Math.random() * ALL_SNIPPETS.length)]
}
