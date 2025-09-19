const BASE_URL = 'https://slack.com/api'
const SLACK_OAUTH_URL = 'https://slack.com/oauth/v2/authorize'

const getToken = () => localStorage.getItem('slack_token')
const getAccessToken = () => localStorage.getItem('slack_access_token')
const getRefreshToken = () => localStorage.getItem('slack_refresh_token')

const makeRequest = async (endpoint, options = {}) => {
  const token = getAccessToken() || getToken()
  
  if (!token) {
    throw new Error('No authentication token found')
  }

  // Use our proxy API to avoid CORS issues
  const proxyUrl = '/api/slack-proxy'
  
  // Determine content type based on endpoint
  const isSlackAPI = endpoint.startsWith('/')
  const contentType = (isSlackAPI && options.method !== 'GET') ? 'form' : 'json'
  
  const config = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      endpoint,
      method: options.method || 'GET',
      body: options.body,
      token,
      contentType
    })
  }

  try {
    const response = await fetch(proxyUrl, config)
    const data = await response.json()
    
    if (!data.ok) {
      throw new Error(data.error || 'API request failed')
    }
    
    return data
  } catch (error) {
    console.error('Slack API Error:', error)
    throw error
  }
}

// OAuth Configuration
export const getOAuthConfig = () => {
  return {
    clientId: import.meta.env.VITE_SLACK_CLIENT_ID || 'your-client-id',
    redirectUri: `${window.location.origin}/oauth/callback`,
    scope: 'chat:write,channels:read,groups:read,im:read,mpim:read,users:read',
    state: Math.random().toString(36).substring(7)
  }
}

// OAuth Functions
export const initiateOAuth = () => {
  const config = getOAuthConfig()
  const params = new URLSearchParams({
    client_id: config.clientId,
    scope: config.scope,
    redirect_uri: config.redirectUri,
    state: config.state
  })
  
  // Store state for verification
  localStorage.setItem('oauth_state', config.state)
  
  // Redirect to Slack OAuth
  window.location.href = `${SLACK_OAUTH_URL}?${params.toString()}`
}

export const exchangeCodeForToken = async (code, state) => {
  const storedState = localStorage.getItem('oauth_state')
  
  if (state !== storedState) {
    throw new Error('Invalid state parameter')
  }
  
  const config = getOAuthConfig()
  
  // Use proxy for OAuth token exchange
  const response = await fetch('/api/slack-proxy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      endpoint: '/oauth.v2.access',
      method: 'POST',
      body: {
        client_id: config.clientId,
        client_secret: import.meta.env.VITE_SLACK_CLIENT_SECRET || 'your-client-secret',
        code: code,
        redirect_uri: config.redirectUri
      },
      contentType: 'form'
    })
  })
  
  const data = await response.json()
  
  if (!data.ok) {
    throw new Error(data.error || 'OAuth token exchange failed')
  }
  
  // Store tokens
  localStorage.setItem('slack_access_token', data.access_token)
  if (data.refresh_token) {
    localStorage.setItem('slack_refresh_token', data.refresh_token)
  }
  
  // Clean up
  localStorage.removeItem('oauth_state')
  
  return data
}

export const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    throw new Error('No refresh token available')
  }
  
  const response = await fetch(`${BASE_URL}/oauth.v2.access`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: getOAuthConfig().clientId,
      client_secret: import.meta.env.VITE_SLACK_CLIENT_SECRET || 'your-client-secret',
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })
  })
  
  const data = await response.json()
  
  if (!data.ok) {
    throw new Error(data.error || 'Token refresh failed')
  }
  
  // Update stored tokens
  localStorage.setItem('slack_access_token', data.access_token)
  if (data.refresh_token) {
    localStorage.setItem('slack_refresh_token', data.refresh_token)
  }
  
  return data
}

// Authentication
export const getAuthTest = async () => {
  return makeRequest('/auth.test')
}

// Message operations
export const sendMessage = async (channel, text, options = {}) => {
  const payload = {
    channel,
    text,
    ...options
  }

  return makeRequest('/chat.postMessage', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export const scheduleMessage = async (channel, text, postAt, options = {}) => {
  const payload = {
    channel,
    text,
    post_at: postAt,
    ...options
  }

  return makeRequest('/chat.scheduleMessage', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export const getMessage = async (channel, ts) => {
  return makeRequest(`/conversations.history?channel=${channel}&latest=${ts}&limit=1&inclusive=true`)
}

export const editMessage = async (channel, ts, text, options = {}) => {
  const payload = {
    channel,
    ts,
    text,
    ...options
  }

  return makeRequest('/chat.update', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export const deleteMessage = async (channel, ts) => {
  const payload = {
    channel,
    ts
  }

  return makeRequest('/chat.delete', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

// Channel operations
export const getChannels = async () => {
  try {
    // Try multiple approaches to get channels
    const approaches = [
      '/conversations.list?types=public_channel,private_channel&limit=100',
      '/conversations.list?types=public_channel&limit=100',
      '/conversations.list?limit=100'
    ]
    
    for (const endpoint of approaches) {
      try {
        const response = await makeRequest(endpoint)
        if (response.channels && response.channels.length > 0) {
          return response
        }
      } catch (err) {
        console.log(`Failed with endpoint ${endpoint}:`, err.message)
        continue
      }
    }
    
    // If all approaches fail, return empty array
    return { channels: [] }
  } catch (error) {
    console.error('All channel fetch attempts failed:', error)
    return { channels: [] }
  }
}

export const getChannelHistory = async (channel, limit = 50) => {
  return makeRequest(`/conversations.history?channel=${channel}&limit=${limit}`)
}

// User operations
export const getUsers = async () => {
  return makeRequest('/users.list')
}

// Scheduled messages
export const getScheduledMessages = async (channel) => {
  return makeRequest(`/chat.scheduledMessages.list?channel=${channel}`)
}

export const deleteScheduledMessage = async (channel, scheduled_message_id) => {
  const payload = {
    channel,
    scheduled_message_id
  }

  return makeRequest('/chat.deleteScheduledMessage', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}
