import crypto from 'node:crypto'

// 确保 Node.js 运行时下 Web Crypto 完整就绪
if (typeof globalThis.crypto === 'undefined') {
  // @ts-ignore
  globalThis.crypto = crypto
} else {
  if (!globalThis.crypto.randomUUID && crypto.randomUUID) {
    globalThis.crypto.randomUUID = crypto.randomUUID.bind(crypto)
  }
  if (!globalThis.crypto.subtle && (crypto as any).webcrypto) {
    // @ts-ignore
    globalThis.crypto.subtle = (crypto as any).webcrypto.subtle
  }
}

import app from './index'

/**
 * EdgeOne Makers Cloud Functions 标准入口 onRequest
 * 接收 Web Standard Request 和 context，交由 Hono 实例处理
 */
export async function onRequest(context: any) {
  const req = context.request
  const env = {
    ADMIN_USERNAME: process.env.ADMIN_USERNAME || 'admin',
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'yxy.@990524gdg',
    OPENCODE_MIRRORS_URL: process.env.OPENCODE_MIRRORS_URL,
    AG_CLIENT_ID: process.env.AG_CLIENT_ID,
    AG_CLIENT_SECRET: process.env.AG_CLIENT_SECRET,
    ...process.env,
    ...(context?.env || {}),
  }
  return await app.fetch(req, env, context)
}

// 导出 Hono 实例以供 EdgeOne 框架识别层自动支持
export default app
