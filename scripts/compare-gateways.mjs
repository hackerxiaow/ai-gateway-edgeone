/**
 * 全量量化对比测试：ai-gateway (Cloudflare Pages) vs ai-gateway-edgeone (腾讯云 EdgeOne)
 *
 * 测试维度：
 *  1. 站点基本信息与配置一致性（渠道数、模型数、令牌数）
 *  2. 渠道与模型清单逐项对比
 *  3. 全量模型真实对话调用（可用性 / 状态码 / 延迟 / Token 用量）
 *  4. 汇总差异报告
 *
 * 用法：node scripts/compare-gateways.mjs
 */

const SITES = [
  {
    name: 'ai-gateway (Cloudflare Pages)',
    short: 'CF-Pages',
    baseUrl: 'https://api.seurl.eu.org',
  },
  {
    name: 'ai-gateway-edgeone (腾讯云 EdgeOne)',
    short: 'EdgeOne',
    baseUrl: process.env.EO_BASE_URL || 'https://ai-gateway-edgeone-kuqnd19q.edgeone.cool',
    // EdgeOne 预览网关鉴权参数（每次部署后 eo_token 会更新，可用环境变量覆盖）
    gatewayQuery: process.env.EO_GATEWAY_QUERY || '?eo_token=d60737f66e7a1777904b58dbb4f5b664&eo_time=1790273970',
  },
]

const ADMIN_KEY = 'sk_cf_2781e99f40f74df98c51a4592ab7ad95'
const ADMIN_USER = 'admin'
const ADMIN_PASS = 'yxy.@990524gdg'
const CALL_TIMEOUT_MS = 60000

/** 通用：带 Cookie 会话的 HTTP 客户端 */
function createClient(site) {
  const cookies = {}

  function updateCookies(res) {
    const raw = res.headers.get('set-cookie')
    if (!raw) return
    for (const p of raw.split(/,(?=[^;]+?=)/)) {
      const pair = p.trim().split(';')[0]
      const eq = pair.indexOf('=')
      if (eq > 0) cookies[pair.slice(0, eq).trim()] = pair.slice(eq + 1).trim()
    }
  }

  function cookieHeader() {
    return Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join('; ')
  }

  async function init() {
    if (!site.gatewayQuery) return
    const res = await fetch(`${site.baseUrl}/${site.gatewayQuery}`, { redirect: 'manual' })
    updateCookies(res)
  }

  async function login() {
    const res = await fetch(`${site.baseUrl}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookieHeader() },
      body: JSON.stringify({ username: ADMIN_USER, password: ADMIN_PASS }),
    })
    updateCookies(res)
    return res.status
  }

  async function api(path, options = {}) {
    const res = await fetch(`${site.baseUrl}${path}`, {
      ...options,
      headers: { Cookie: cookieHeader(), ...(options.headers || {}) },
    })
    updateCookies(res)
    return res
  }

  return { init, login, api, cookieHeader }
}

/** 拉取站点快照（状态 + 渠道 + 令牌） */
async function fetchSnapshot(site) {
  const client = createClient(site)
  await client.init()
  const loginStatus = await client.login()

  const statusRes = await client.api('/admin/api/status')
  const statusData = await statusRes.json().catch(() => ({}))

  const provRes = await client.api('/admin/api/providers')
  const provData = await provRes.json().catch(() => ({}))

  const keysRes = await client.api('/admin/api/proxy-keys')
  const keysData = await keysRes.json().catch(() => ({}))

  return {
    loginStatus,
    status: statusData.data || null,
    providers: provData.data || [],
    proxyKeys: keysData.data || [],
  }
}

/** 调用单个模型（对 429/5xx/超时 做一次重试，规避上游偶发限流对可用性统计的干扰） */
async function callModel(site, model, timeoutMs = CALL_TIMEOUT_MS) {
  const first = await callModelOnce(site, model, timeoutMs)
  if (first.ok && first.hasContent) return first
  // 仅对「可能为偶发」的错误重试：429 / 5xx / 超时 / 连接错误
  const retriable = first.status === 429 || first.status === 0 || first.status >= 500
  if (!retriable) return first
  await new Promise(r => setTimeout(r, 2500))
  const second = await callModelOnce(site, model, timeoutMs)
  return second.ok && second.hasContent ? { ...second, retried: true } : first
}

/** 单次调用 */
async function callModelOnce(site, model, timeoutMs) {
  const client = createClient(site)
  await client.init()

  const started = Date.now()
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(`${site.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ADMIN_KEY}`,
        Cookie: client.cookieHeader(),
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: '请用一句话回答：你好' }],
        max_tokens: 50,
        stream: false,
      }),
      signal: controller.signal,
    })
    const latencyMs = Date.now() - started
    const text = await res.text()
    let parsed = null
    try { parsed = JSON.parse(text) } catch { /* 非 JSON */ }

    const content = parsed?.choices?.[0]?.message?.content
    const reasoning = parsed?.choices?.[0]?.message?.reasoning
    const usage = parsed?.usage

    return {
      model,
      ok: res.status === 200,
      status: res.status,
      latencyMs,
      hasContent: Boolean((content && content.trim()) || (reasoning && reasoning.trim())),
      contentPreview: (content || reasoning || '').replace(/\s+/g, ' ').slice(0, 60),
      promptTokens: usage?.prompt_tokens ?? 0,
      completionTokens: usage?.completion_tokens ?? 0,
      error: res.status === 200 ? null : (parsed?.error?.message || text.slice(0, 160)),
    }
  } catch (e) {
    return {
      model,
      ok: false,
      status: 0,
      latencyMs: Date.now() - started,
      hasContent: false,
      contentPreview: '',
      promptTokens: 0,
      completionTokens: 0,
      error: e.name === 'AbortError' ? `请求超时 (>${timeoutMs}ms)` : e.message,
    }
  } finally {
    clearTimeout(timer)
  }
}

/** 并发池 */
async function pool(items, limit, worker) {
  const results = []
  let cursor = 0
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const idx = cursor++
      results[idx] = await worker(items[idx], idx)
    }
  })
  await Promise.all(runners)
  return results
}

function fmtPct(n, d) {
  if (!d) return '0.0%'
  return `${((n / d) * 100).toFixed(1)}%`
}

function median(arr) {
  if (!arr.length) return 0
  const s = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(s.length / 2)
  return s.length % 2 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2)
}

async function main() {
  const onlyCall = process.argv.includes('--call')
  const concurrency = Number(process.env.CONCURRENCY || 4)

  console.log('═'.repeat(78))
  console.log('  全量量化对比测试：Cloudflare Pages  vs  腾讯云 EdgeOne')
  console.log('═'.repeat(78))

  // ===== 阶段一：配置快照 =====
  console.log('\n【阶段一】拉取两站配置快照...\n')
  const snapshots = {}
  for (const site of SITES) {
    process.stdout.write(`  → ${site.name} ... `)
    try {
      snapshots[site.short] = await fetchSnapshot(site)
      const s = snapshots[site.short]
      console.log(`OK (登录 ${s.loginStatus}, 渠道 ${s.providers.length}, 令牌 ${s.proxyKeys.length})`)
    } catch (e) {
      console.log(`失败: ${e.message}`)
      snapshots[site.short] = null
    }
  }

  // ===== 阶段二：配置一致性对比 =====
  console.log('\n【阶段二】配置一致性对比\n')
  const rows = []
  for (const site of SITES) {
    const s = snapshots[site.short]
    rows.push({
      '站点': site.short,
      '登录': s?.loginStatus ?? '-',
      '渠道总数': s?.status?.providersCount ?? '-',
      '启用渠道': s?.status?.enabledProvidersCount ?? '-',
      '模型总数': s?.status?.modelsCount ?? '-',
      '启用模型': s?.status?.enabledModelsCount ?? '-',
      '令牌总数': s?.status?.proxyKeysCount ?? '-',
    })
  }
  console.table(rows)

  // 渠道清单差异
  const cfProv = new Map((snapshots['CF-Pages']?.providers || []).map(p => [p.id, p]))
  const eoProv = new Map((snapshots['EdgeOne']?.providers || []).map(p => [p.id, p]))
  const allIds = [...new Set([...cfProv.keys(), ...eoProv.keys()])].sort()

  console.log('\n渠道逐项对比:')
  const provDiff = []
  for (const id of allIds) {
    const a = cfProv.get(id)
    const b = eoProv.get(id)
    const modelSet = (p) => new Set((p?.models || []).map(m => m.id))
    const aModels = modelSet(a)
    const bModels = modelSet(b)
    const onlyCf = [...aModels].filter(m => !bModels.has(m))
    const onlyEo = [...bModels].filter(m => !aModels.has(m))
    const same = onlyCf.length === 0 && onlyEo.length === 0

    const status = !a ? '仅 EdgeOne 有' : !b ? '仅 CF-Pages 有' : same ? '一致' : '模型有差异'
    provDiff.push({ id, status, cfModels: aModels.size, eoModels: bModels.size, onlyCf: onlyCf.length, onlyEo: onlyEo.length })

    const mark = status === '一致' ? '✓' : '!'
    console.log(`  ${mark} [${id.padEnd(14)}] ${status.padEnd(14)} CF模型=${String(aModels.size).padStart(2)} EdgeOne模型=${String(bModels.size).padStart(2)}` +
      (onlyCf.length ? `  仅CF: ${onlyCf.join(', ')}` : '') +
      (onlyEo.length ? `  仅EO: ${onlyEo.join(', ')}` : ''))
  }

  // ===== 阶段三：全量模型调用测试 =====
  const modelList = []
  for (const [id, p] of eoProv) {
    if (!p.enabled) continue
    for (const m of p.models || []) {
      if (!m.enabled) continue
      // 跳过非对话类（TTS 音色 / 图像生成 / 视频）
      if (id === 'Azure' || id === 'agnes-video') continue
      if (/_image|image-|lyria|embedding/.test(m.id)) continue
      modelList.push({ provider: id, model: `${id}/${m.id}` })
    }
  }

  if (!onlyCall) {
    console.log(`\n【阶段三】待测模型清单（EdgeOne 启用中的对话类模型，共 ${modelList.length} 个）`)
    const byProv = {}
    for (const m of modelList) byProv[m.provider] = (byProv[m.provider] || 0) + 1
    console.log('  ' + Object.entries(byProv).map(([k, v]) => `${k}=${v}`).join('  '))
    console.log('\n提示：加 --call 参数执行真实全量调用测试（耗时较长）。')
    return
  }

  console.log(`\n【阶段三】全量真实调用测试（共 ${modelList.length} 个模型 × ${SITES.length} 站，并发 ${concurrency}）\n`)

  const summary = {}
  for (const site of SITES) {
    console.log(`\n──────── ${site.name} ────────`)
    const t0 = Date.now()
    const results = await pool(modelList, concurrency, async (item, i) => {
      const r = await callModel(site, item.model)
      const flag = r.ok && r.hasContent ? '✓' : r.ok ? '~' : '✗'
      process.stdout.write(
        `  ${flag} [${String(i + 1).padStart(2)}/${modelList.length}] ${item.model.padEnd(46)} ` +
        `${String(r.status).padStart(3)} ${String(r.latencyMs).padStart(6)}ms ${r.ok ? '' : (r.error || '').slice(0, 70)}\n`
      )
      return r
    })
    const elapsed = Date.now() - t0

    const okCount = results.filter(r => r.ok).length
    const contentCount = results.filter(r => r.ok && r.hasContent).length
    const latencies = results.filter(r => r.ok).map(r => r.latencyMs)

    summary[site.short] = {
      total: results.length,
      ok: okCount,
      withContent: contentCount,
      promptTokens: results.reduce((s, r) => s + r.promptTokens, 0),
      completionTokens: results.reduce((s, r) => s + r.completionTokens, 0),
      avgLatency: latencies.length ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0,
      medianLatency: median(latencies),
      elapsedMs: elapsed,
      results,
    }
    console.log(`\n  ${site.short} 汇总: HTTP 200 = ${okCount}/${results.length} (${fmtPct(okCount, results.length)})，` +
      `有内容 = ${contentCount}，平均延迟 ${summary[site.short].avgLatency}ms，耗时 ${(elapsed / 1000).toFixed(1)}s`)
  }

  // ===== 阶段四：汇总报告 =====
  console.log('\n' + '═'.repeat(78))
  console.log('  量化结果汇总')
  console.log('═'.repeat(78) + '\n')

  const summaryRows = SITES.map(site => {
    const s = summary[site.short]
    return {
      '站点': site.short,
      '测试模型数': s.total,
      'HTTP 200': `${s.ok} (${fmtPct(s.ok, s.total)})`,
      '有内容': `${s.withContent} (${fmtPct(s.withContent, s.total)})`,
      '输入Tokens': s.promptTokens,
      '输出Tokens': s.completionTokens,
      '平均延迟': `${s.avgLatency}ms`,
      '中位延迟': `${s.medianLatency}ms`,
      '总耗时': `${(s.elapsedMs / 1000).toFixed(1)}s`,
    }
  })
  console.table(summaryRows)

  // 逐模型差异对比
  console.log('\n逐模型可用性差异（仅列出两站结果不一致的项）:\n')
  const cfResults = new Map((summary['CF-Pages']?.results || []).map(r => [r.model, r]))
  const eoResults = new Map((summary['EdgeOne']?.results || []).map(r => [r.model, r]))
  let diffCount = 0
  const diffRows = []
  for (const { model } of modelList) {
    const a = cfResults.get(model)
    const b = eoResults.get(model)
    const aOk = a?.ok && a?.hasContent
    const bOk = b?.ok && b?.hasContent
    if (aOk !== bOk) {
      diffCount++
      diffRows.push({
        '模型': model,
        'CF-Pages': aOk ? '可用' : `不可用(${a?.status || 0})`,
        'EdgeOne': bOk ? '可用' : `不可用(${b?.status || 0})`,
        'CF错误': (a?.error || '').slice(0, 50),
        'EO错误': (b?.error || '').slice(0, 50),
      })
    }
  }
  if (diffCount === 0) {
    console.log('  ✓ 两站在全部测试模型上可用性完全一致')
  } else {
    console.table(diffRows)
  }

  // 两站共同不可用的模型
  const bothFail = modelList.filter(({ model }) => {
    const a = cfResults.get(model); const b = eoResults.get(model)
    return !(a?.ok && a?.hasContent) && !(b?.ok && b?.hasContent)
  })
  if (bothFail.length) {
    console.log(`\n两站均不可用的模型（共 ${bothFail.length} 个，属上游渠道本身问题，非平台差异）:`)
    for (const { model } of bothFail) {
      const a = cfResults.get(model)
      console.log(`  - ${model.padEnd(46)} ${(a?.error || '').slice(0, 80)}`)
    }
  }

  console.log('\n' + '═'.repeat(78))
  console.log('  对比测试完成')
  console.log('═'.repeat(78))
}

main().catch(e => { console.error('测试失败:', e); process.exit(1) })
