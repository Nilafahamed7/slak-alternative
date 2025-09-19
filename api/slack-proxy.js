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
    const { endpoint, method = 'GET', body, token } = req.body || {}
    
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
        'Content-Type': 'application/json',
      },
    }

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(url, options)
    const data = await response.json()

    res.status(200).json(data)
  } catch (error) {
    console.error('Proxy error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
