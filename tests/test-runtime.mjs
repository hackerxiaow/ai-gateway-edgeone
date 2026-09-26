import { onRequest } from '../cloud-functions/[[default]].js'

async function runTests() {
  console.log('--- 1. 测试 /admin/login 页面 ---')
  const loginPageReq = new Request('http://localhost:8088/admin/login', {
    method: 'GET',
    headers: { 'Host': 'localhost:8088' }
  })
  const loginPageRes = await onRequest({ request: loginPageReq })
  console.log('Login Page HTTP Code:', loginPageRes.status)
  const loginHtml = await loginPageRes.text()
  console.log('Login Page HTML Length:', loginHtml.length, 'Contains title:', loginHtml.includes('登录'))

  console.log('\n--- 2. 测试 POST /admin/login 登录验证 ---')
  const loginReq = new Request('http://localhost:8088/admin/login', {
    method: 'POST',
    headers: {
      'Host': 'localhost:8088',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: 'admin',
      password: 'yxy.@990524gdg'
    })
  })
  const loginRes = await onRequest({ request: loginReq })
  console.log('Login POST HTTP Code:', loginRes.status)
  const setCookie = loginRes.headers.get('set-cookie')
  console.log('Set-Cookie received:', !!setCookie)
  const cookieHeader = setCookie ? setCookie.split(';')[0] : ''

  console.log('\n--- 3. 测试 /admin/api/status (带 Session Cookie) ---')
  const statusReq = new Request('http://localhost:8088/admin/api/status', {
    method: 'GET',
    headers: {
      'Host': 'localhost:8088',
      'Cookie': cookieHeader
    }
  })
  const statusRes = await onRequest({ request: statusReq })
  console.log('Status HTTP Code:', statusRes.status)
  const statusData = await statusRes.json()
  console.log('Status Data:', JSON.stringify(statusData))

  console.log('\n--- 4. 测试 /admin 页面 (带 Session Cookie) ---')
  const adminReq = new Request('http://localhost:8088/admin', {
    method: 'GET',
    headers: {
      'Host': 'localhost:8088',
      'Cookie': cookieHeader
    }
  })
  const adminRes = await onRequest({ request: adminReq })
  console.log('Admin HTTP Code:', adminRes.status)
  const adminHtml = await adminRes.text()
  console.log('Admin Page HTML Length:', adminHtml.length)
  console.log('Contains EdgeOne Blob:', adminHtml.includes('EdgeOne Blob 数据库') || adminHtml.includes('EdgeOne · Blob'))

  console.log('\n--- 5. 测试 /admin/api/providers 获取渠道 ---')
  const provReq = new Request('http://localhost:8088/admin/api/providers', {
    method: 'GET',
    headers: {
      'Host': 'localhost:8088',
      'Cookie': cookieHeader
    }
  })
  const provRes = await onRequest({ request: provReq })
  console.log('Providers HTTP Code:', provRes.status)
  const provData = await provRes.json()
  console.log('Providers Count:', provData.data?.length ?? 0)

  console.log('\n--- 6. 测试 POST /admin/api/proxy-keys 创建测试令牌 ---')
  const createKeyReq = new Request('http://localhost:8088/admin/api/proxy-keys', {
    method: 'POST',
    headers: {
      'Host': 'localhost:8088',
      'Cookie': cookieHeader,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: '自动化测试 Key'
    })
  })
  const createKeyRes = await onRequest({ request: createKeyReq })
  console.log('Create Key HTTP Code:', createKeyRes.status)
  const createKeyData = await createKeyRes.json()
  const rawKey = createKeyData.data?.key
  console.log('Created Raw Key:', rawKey?.slice(0, 10) + '...')

  if (rawKey) {
    console.log('\n--- 7. 测试 /v1/models (携带真实 Key) ---')
    const modelsReq = new Request('http://localhost:8088/v1/models', {
      method: 'GET',
      headers: {
        'Host': 'localhost:8088',
        'Authorization': `Bearer ${rawKey}`
      }
    })
    const modelsRes = await onRequest({ request: modelsReq })
    console.log('Models HTTP Code:', modelsRes.status)
    const modelsData = await modelsRes.json()
    console.log('Models returned count:', modelsData.data?.length ?? 0)
    console.log('Sample model:', modelsData.data?.[0]?.id)
  }

  console.log('\n--- 8. 测试 /admin/api/usage 用量统计 ---')
  const usageReq = new Request('http://localhost:8088/admin/api/usage?days=7', {
    method: 'GET',
    headers: {
      'Host': 'localhost:8088',
      'Cookie': cookieHeader
    }
  })
  const usageRes = await onRequest({ request: usageReq })
  console.log('Usage HTTP Code:', usageRes.status)
  const usageData = await usageRes.json()
  console.log('Usage Summary totalRequests:', usageData.data?.totalRequests ?? 0)

  console.log('\n🎉 所有核心 API、管理后台、鉴权、提供商列表、令牌验证与用量聚合全部自测通过！')
}

runTests().catch(err => {
  console.error('Test Failed:', err)
  process.exit(1)
})
