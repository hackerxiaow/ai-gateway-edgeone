import { KV_KEYS } from './config'
import type { Env, Provider, ProxyKey, Session } from './types'
import { getKV, addUsageRecordBlob, getUsageSummaryBlob } from './storage-adapter'

// ===== 提供商 CRUD =====

export async function getProviders(env: Env): Promise<Provider[]> {
  const data = await getKV(env).get(KV_KEYS.PROVIDERS)
  return data ? JSON.parse(data) : []
}

export async function getProvider(env: Env, id: string): Promise<Provider | null> {
  const providers = await getProviders(env)
  return providers.find((p) => p.id === id) ?? null
}

export async function setProviders(env: Env, providers: Provider[]): Promise<void> {
  await getKV(env).put(KV_KEYS.PROVIDERS, JSON.stringify(providers))
}

export async function addProvider(env: Env, provider: Provider): Promise<void> {
  const providers = await getProviders(env)
  providers.push(provider)
  await setProviders(env, providers)
}

export async function updateProvider(env: Env, id: string, updates: Partial<Provider>): Promise<Provider | null> {
  const providers = await getProviders(env)
  const index = providers.findIndex((p) => p.id === id)
  if (index === -1) return null
  providers[index] = { ...providers[index], ...updates, updatedAt: new Date().toISOString() }
  await setProviders(env, providers)
  return providers[index]
}

export async function deleteProvider(env: Env, id: string): Promise<boolean> {
  const providers = await getProviders(env)
  const filtered = providers.filter((p) => p.id !== id)
  if (filtered.length === providers.length) return false
  await setProviders(env, filtered)
  return true
}

// ===== 管理员凭据(持久化到存储, 登录时写入; 备份/恢复不含) =====

const ADMIN_CRED_KEY = 'admin:credentials'

export interface AdminCredentials {
  username: string
  /** SHA-256 哈希, 不存明文 */
  passwordHash: string
}

/** 读取管理员凭据(可能来自环境变量初始化或上次登录写入) */
export async function getAdminCredentials(env: Env): Promise<AdminCredentials | null> {
  const data = await getKV(env).get(ADMIN_CRED_KEY)
  if (!data) return null
  try {
    return JSON.parse(data) as AdminCredentials
  } catch {
    return null
  }
}

/** 写入管理员凭据(登录成功后调用, 保证重启后可用) */
export async function setAdminCredentials(env: Env, username: string, passwordHash: string): Promise<void> {
  await getKV(env).put(ADMIN_CRED_KEY, JSON.stringify({ username, passwordHash } satisfies AdminCredentials))
}

/** 强制登出所有会话(导入/恢复后调用) */
export async function deleteAllSessions(env: Env): Promise<void> {
  const store = getKV(env)
  let cursor: string | undefined
  do {
    const page = await store.list({ prefix: KV_KEYS.SESSION_PREFIX, cursor })
    for (const k of page.keys) await store.delete(k.name)
    cursor = page.cursor
  } while (cursor)
}

// ===== Session 管理 =====

export async function createSession(env: Env, username: string, ttlSeconds: number): Promise<string> {
  const sessionId = crypto.randomUUID()
  const session: Session = {
    username,
    expiresAt: Date.now() + ttlSeconds * 1000,
  }
  await getKV(env).put(KV_KEYS.SESSION_PREFIX + sessionId, JSON.stringify(session), {
    expirationTtl: ttlSeconds,
  })
  return sessionId
}

export async function getSession(env: Env, sessionId: string): Promise<Session | null> {
  const data = await getKV(env).get(KV_KEYS.SESSION_PREFIX + sessionId)
  if (!data) return null
  const session: Session = JSON.parse(data)
  if (session.expiresAt < Date.now()) {
    await deleteSession(env, sessionId)
    return null
  }
  return session
}

export async function deleteSession(env: Env, sessionId: string): Promise<void> {
  await getKV(env).delete(KV_KEYS.SESSION_PREFIX + sessionId)
}

// ===== 转发 Key =====

export async function getProxyKeys(env: Env): Promise<ProxyKey[]> {
  const data = await getKV(env).get(KV_KEYS.PROXY_KEYS)
  return data ? JSON.parse(data) : []
}

export async function setProxyKeys(env: Env, keys: ProxyKey[]): Promise<void> {
  await getKV(env).put(KV_KEYS.PROXY_KEYS, JSON.stringify(keys))
}

export async function addProxyKey(env: Env, key: ProxyKey): Promise<void> {
  const keys = await getProxyKeys(env)
  keys.push(key)
  await setProxyKeys(env, keys)
}

export async function deleteProxyKey(env: Env, id: string): Promise<boolean> {
  const keys = await getProxyKeys(env)
  const filtered = keys.filter((k) => k.id !== id)
  if (filtered.length === keys.length) return false
  await setProxyKeys(env, filtered)
  return true
}

export async function updateProxyKey(env: Env, id: string, updates: Partial<ProxyKey>): Promise<ProxyKey | null> {
  const keys = await getProxyKeys(env)
  const idx = keys.findIndex(k => k.id === id)
  if (idx === -1) return null
  keys[idx] = { ...keys[idx], ...updates }
  await setProxyKeys(env, keys)
  return keys[idx]
}

export async function validateProxyKey(env: Env, key: string): Promise<boolean> {
  const keys = await getProxyKeys(env)
  return keys.some((k) => {
    if (k.key !== key || !k.enabled) return false
    if (k.expiresAt) {
      const now = Date.now()
      const expires = new Date(k.expiresAt).getTime()
      if (now >= expires) return false
    }
    return true
  })
}

// ===== 初始数据填充 =====

import { DEFAULT_PROVIDERS, PROXY_KEY_PREFIX } from './config'
import { USAGE_RETENTION_DAYS } from './config'
import type { UsageRecord, UsageSummary } from './types'

export async function seedInitialData(env: Env): Promise<void> {
  const providers = await getProviders(env)
  const migrationCompleted = await getKV(env).get(KV_KEYS.OPENCODE_MIGRATION)
  const opencode = DEFAULT_PROVIDERS.find((provider) => provider.id === 'opencode')

  if (!migrationCompleted) {
    if (opencode && !providers.some((provider) => provider.id === opencode.id)) {
      await setProviders(env, [
        ...providers,
        {
          ...opencode,
          apiKeys: opencode.apiKeys.map((key) => ({ ...key })),
          models: opencode.models.map((model) => ({ ...model })),
        },
      ])
    }
    await getKV(env).put(KV_KEYS.OPENCODE_MIGRATION, '1')
  }

  // 仅首次运行时创建测试转发 Key
  if (providers.length === 0 && !migrationCompleted) {
    const keys = await getProxyKeys(env)
    if (keys.length === 0) {
      const testKey = {
        id: crypto.randomUUID(),
        key: `${PROXY_KEY_PREFIX}${crypto.randomUUID().replace(/-/g, '').substring(0, 16)}`,
        name: '测试 Key',
        enabled: true,
        createdAt: new Date().toISOString(),
      }
      await addProxyKey(env, testKey)
    }
  }
}

// ===== Token 用量统计 =====

/** 写入一条用量记录（基于 EdgeOne Blob 存储） */
export async function addUsageRecord(env: Env, record: UsageRecord): Promise<void> {
  await addUsageRecordBlob(env, record)
}

/** 聚合最近 N 天的用量（基于 EdgeOne Blob 存储） */
export async function getUsageSummary(env: Env, days: number): Promise<UsageSummary> {
  return await getUsageSummaryBlob(env, days)
}