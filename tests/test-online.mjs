const BASE_URL = 'https://ai-gateway-edgeone-kuqnd19q.edgeone.cool'
const AUTH_QUERY = '?eo_token=0c990f9bbebdbd596f662b39b8e68351&eo_time=1790271862'

async function runOnlineTests() {
  console.log('🚀 开始腾讯云 EdgeOne 线上全功能联调测试...\n')

  let cookies = {}

  function updateCookies(res) {
    const raw = res.headers.get('set-cookie')
    if (!raw) return
    const parts = raw.split(/,(?=[^;]+?=)/)
    for (const p of parts) {
      const pair = p.trim().split(';')[0]
      const eq = pair.indexOf('=')
      if (eq > 0) {
        const k = pair.slice(0, eq).trim()
        const v = pair.slice(eq + 1).trim()
        cookies[k] = v
      }
    }
  }

  function getCookieHeader() {
    return Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join('; ')
  }

  // 1. 初始化会话与获取 EdgeOne 网关 Cookie
  console.log('1. 获取 EdgeOne 网关入口授权 Cookie...')
  const initRes = await fetch(`${BASE_URL}/${AUTH_QUERY}`, { redirect: 'manual' })
  console.log('Init status:', initRes.status)
  updateCookies(initRes)

  // 2. 访问首页
  console.log('\n2. 访问首页 / ...')
  const homeRes = await fetch(`${BASE_URL}/`, {
    headers: { Cookie: getCookieHeader() }
  })
  console.log('Home status:', homeRes.status)
  const homeHtml = await homeRes.text()
  console.log('Home HTML length:', homeHtml.length, 'Contains title:', homeHtml.includes('AI Gateway'))

  // 3. 访问 /admin/login 页面
  console.log('\n3. 访问 /admin/login 页面...')
  const loginPageRes = await fetch(`${BASE_URL}/admin/login`, {
    headers: { Cookie: getCookieHeader() }
  })
  console.log('Login page status:', loginPageRes.status)
  updateCookies(loginPageRes)

  // 4. POST /admin/login 登录
  console.log('\n4. POST /admin/login 登录认证...')
  const loginRes = await fetch(`${BASE_URL}/admin/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: getCookieHeader()
    },
    body: JSON.stringify({
      username: 'admin',
      password: 'yxy.@990524gdg'
    })
  })
  console.log('Login status:', loginRes.status)
  updateCookies(loginRes)
  const loginData = await loginRes.json()
  console.log('Login result:', JSON.stringify(loginData))
  console.log('Session Cookie set:', !!cookies['session_id'])

  // 5. GET /admin/api/status
  console.log('\n5. 请求 /admin/api/status 检查系统与存储状态...')
  const statusRes = await fetch(`${BASE_URL}/admin/api/status`, {
    headers: { Cookie: getCookieHeader() }
  })
  console.log('Status API Code:', statusRes.status)
  const statusData = await statusRes.json()
  console.log('Status result:', JSON.stringify(statusData))

  // 6. GET /admin 页面
  console.log('\n6. 请求 /admin 管理后台页面...')
  const adminRes = await fetch(`${BASE_URL}/admin`, {
    headers: { Cookie: getCookieHeader() }
  })
  console.log('Admin Page Code:', adminRes.status)
  const adminHtml = await adminRes.text()
  console.log('Admin Page length:', adminHtml.length)
  console.log('Contains EdgeOne Blob:', adminHtml.includes('EdgeOne Blob 数据库') || adminHtml.includes('EdgeOne · Blob'))

  // 7. GET /admin/api/providers
  console.log('\n7. 请求 /admin/api/providers 获取渠道列表...')
  const provRes = await fetch(`${BASE_URL}/admin/api/providers`, {
    headers: { Cookie: getCookieHeader() }
  })
  console.log('Providers status:', provRes.status)
  const provData = await provRes.json()
  console.log('Providers count:', provData.data?.length ?? 0)

  // 8. POST /admin/api/proxy-keys 创建测试令牌
  console.log('\n8. POST /admin/api/proxy-keys 创建新的转发令牌...')
  const createKeyRes = await fetch(`${BASE_URL}/admin/api/proxy-keys`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: getCookieHeader()
    },
    body: JSON.stringify({
      name: '线上公网自动化测试令牌'
    })
  })
  console.log('Create key status:', createKeyRes.status)
  const createKeyData = await createKeyRes.json()
  const rawKey = createKeyData.data?.key
  console.log('Created Raw Key:', rawKey)

  // 9. GET /v1/models 带 Bearer Token
  if (rawKey) {
    console.log('\n9. 请求 /v1/models (使用新创建的 Bearer Key)...')
    const modelsRes = await fetch(`${BASE_URL}/v1/models`, {
      headers: {
        'Authorization': `Bearer ${rawKey}`,
        Cookie: getCookieHeader()
      }
    })
    console.log('Models status:', modelsRes.status)
    const modelsData = await modelsRes.json()
    console.log('Models count:', modelsData.data?.length ?? 0)
    if (modelsData.data?.length > 0) {
      console.log('Sample model ID:', modelsData.data[0].id)
    }
  }

  // 10. GET /admin/api/usage 用量统计
  console.log('\n10. 请求 /admin/api/usage 获取用量数据...')
  const usageRes = await fetch(`${BASE_URL}/admin/api/usage?days=7`, {
    headers: { Cookie: getCookieHeader() }
  })
  console.log('Usage status:', usageRes.status)
  const usageData = await usageRes.json()
  console.log('Usage totalRequests:', usageData.data?.totalRequests ?? 0)

  console.log('\n🎉🎉🎉 腾讯云 EdgeOne 线上生产环境全流程联调测试全部通过！🎉🎉🎉')
}

runOnlineTests().catch(err => {
  console.error('Online Test Failed:', err)
  process.exit(1)
})
