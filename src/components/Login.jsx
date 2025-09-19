import React, { useState } from 'react'
import { MessageSquare, Zap, LogIn, Shield } from 'lucide-react'
import { initiateOAuth, clearOAuthState } from '../services/slackService'

const Login = ({ onLogin }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Connect your Slack workspace securely using OAuth
              </p>
              
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
                </div>
              </div>
            </div>

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
