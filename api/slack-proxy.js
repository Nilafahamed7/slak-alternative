// Vercel Serverless Function - Slack API Proxy
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  try {
    const { endpoint, method = 'GET', body, token, contentType = 'json' } = req.body || {}
    
    if (!endpoint) {
      return res.status(400).json({ error: 'Missing endpoint' })
    }

    if (!token) {
      return res.status(400).json({ error: 'Missing token' })
    }

    const url = `https://slack.com/api${endpoint}`
    
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }

    if (body && method !== 'GET') {
      if (contentType === 'form') {
        // Use form-encoded data for Slack API
        options.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        const formData = new URLSearchParams()
        for (const [key, value] of Object.entries(body)) {
          if (typeof value === 'object') {
            formData.append(key, JSON.stringify(value))
          } else {
            formData.append(key, value)
          }
        }
        options.body = formData.toString()
      } else {
        // Use JSON for other APIs
        options.headers['Content-Type'] = 'application/json'
        options.body = JSON.stringify(body)
      }
    }

    const response = await fetch(url, options)
    const data = await response.json()

    res.status(200).json(data)
  } catch (error) {
    console.error('Proxy error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
