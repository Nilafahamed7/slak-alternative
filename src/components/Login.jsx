import React, { useState } from 'react'
import { MessageSquare, Shield, Zap, LogIn } from 'lucide-react'
import { initiateOAuth, clearOAuthState } from '../services/slackService'

const Login = ({ onLogin }) => {
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [authMethod, setAuthMethod] = useState('oauth') // 'oauth' or 'token'

  const handleOAuthLogin = () => {
    setLoading(true)
    setError('')
    try {
      // Clear any existing OAuth state before starting
      clearOAuthState()
      initiateOAuth()
    } catch (err) {
      setError('Failed to initiate OAuth: ' + err.message)
      setLoading(false)
    }
  }

  const handleClearOAuthState = () => {
    clearOAuthState()
    setError('')
    alert('OAuth state cleared. You can now try logging in again.')
  }

  const handleDebugOAuth = () => {
    const oauthState = localStorage.getItem('oauth_state')
    const processedCode = localStorage.getItem('processed_oauth_code')
    const accessToken = localStorage.getItem('slack_access_token')
    
    const debugInfo = {
      oauthState: oauthState || 'none',
      processedCode: processedCode ? `${processedCode.substring(0, 10)}...` : 'none',
      accessToken: accessToken ? `${accessToken.substring(0, 10)}...` : 'none',
      clientId: import.meta.env.VITE_SLACK_CLIENT_ID ? 'present' : 'missing'
    }
    
    alert(`OAuth Debug Info:\n${JSON.stringify(debugInfo, null, 2)}`)
  }

  const handleTokenSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Store token temporarily to test it
      localStorage.setItem('slack_token', token)
      
      // Test the token by making a simple API call
      const response = await fetch('https://slack.com/api/auth.test', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      
      if (data.ok) {
        onLogin(token)
      } else {
        throw new Error(data.error || 'Invalid token')
      }
    } catch (err) {
      setError(err.message)
      localStorage.removeItem('slack_token')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-vibrant-purple via-vibrant-pink to-vibrant-blue flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full">
        <div className="card-colored p-6 sm:p-8 backdrop-blur-sm">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-gradient-to-r from-vibrant-purple to-vibrant-pink rounded-full">
                <MessageSquare className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-vibrant-purple to-vibrant-pink bg-clip-text text-transparent mb-2">Slack Alternative</h1>
            <p className="text-sm sm:text-base text-gray-600">Connect to your Slack workspace</p>
          </div>

          {/* Authentication Method Toggle */}
          <div className="mb-6">
            <div className="flex bg-gradient-to-r from-vibrant-cyan/20 to-vibrant-blue/20 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setAuthMethod('oauth')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 ${
                  authMethod === 'oauth'
                    ? 'bg-gradient-to-r from-vibrant-purple to-vibrant-pink text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-vibrant-purple hover:bg-white/50'
                }`}
              >
                OAuth Login
              </button>
              <button
                type="button"
                onClick={() => setAuthMethod('token')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 ${
                  authMethod === 'token'
                    ? 'bg-gradient-to-r from-vibrant-purple to-vibrant-pink text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-vibrant-purple hover:bg-white/50'
                }`}
              >
                Bot Token
              </button>
            </div>
          </div>

          {authMethod === 'oauth' ? (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Connect your Slack workspace securely using OAuth
                </p>
                <div className="bg-gradient-to-r from-vibrant-cyan/10 to-vibrant-blue/10 border border-vibrant-cyan/30 rounded-lg p-3 mb-4">
                  <p className="text-xs sm:text-sm text-vibrant-blue">
                    <strong>Note:</strong> OAuth codes expire quickly. If you get an "expired code" error, 
                    just click "Try Again" - this is normal!
                  </p>
                </div>
                <button
                  onClick={handleOAuthLogin}
                  disabled={loading}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Redirecting...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <LogIn className="h-4 w-4 mr-2" />
                      Connect with Slack
                    </div>
                  )}
                </button>
                
                <div className="mt-2 space-y-1">
                  <button
                    type="button"
                    onClick={handleClearOAuthState}
                    className="w-full text-xs sm:text-sm text-gray-500 hover:text-gray-700 underline"
                  >
                    Clear OAuth State (if having issues)
                  </button>
                  <button
                    type="button"
                    onClick={handleDebugOAuth}
                    className="w-full text-xs sm:text-sm text-blue-500 hover:text-blue-700 underline"
                  >
                    Debug OAuth State
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleTokenSubmit} className="space-y-6">
              <div>
                <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
                  Slack Bot Token
                </label>
                <input
                  type="password"
                  id="token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="xoxb-your-bot-token-here"
                  className="input-field"
                  required
                />
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Get your bot token from the Slack API dashboard
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !token.trim()}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Connecting...
                  </div>
                ) : (
                  'Connect to Slack'
                )}
              </button>
            </form>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-xs sm:text-sm">{error}</p>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-xs sm:text-sm font-medium text-gray-700 mb-3">Getting Started:</h3>
            <div className="space-y-2 text-xs sm:text-sm text-gray-600">
              <div className="flex items-start">
                <Shield className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <span>Create a Slack app in the Developer Sandbox</span>
              </div>
              <div className="flex items-start">
                <Zap className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                <span>Add bot token scopes: chat:write, channels:read, users:read</span>
              </div>
              <div className="flex items-start">
                <MessageSquare className="h-4 w-4 text-purple-500 mt-0.5 mr-2 flex-shrink-0" />
                <span>Install the app to your workspace</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
