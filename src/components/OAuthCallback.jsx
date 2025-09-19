import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, XCircle, Loader } from 'lucide-react'
import { exchangeCodeForToken, clearOAuthState } from '../services/slackService'

const OAuthCallback = ({ onLogin }) => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('processing')
  const [error, setError] = useState('')

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const code = searchParams.get('code')
        const state = searchParams.get('state')
        const error = searchParams.get('error')

        if (error) {
          setError(`OAuth error: ${error}`)
          setStatus('error')
          setTimeout(() => navigate('/login'), 3000)
          return
        }

        if (!code) {
          setError('Missing authorization code')
          setStatus('error')
          setTimeout(() => navigate('/login'), 3000)
          return
        }

        setStatus('success')
        const tokenData = await exchangeCodeForToken(code, state)
        onLogin(tokenData.access_token)
        setTimeout(() => navigate('/dashboard'), 500)

      } catch (err) {
        setError('OAuth code has expired. Please try logging in again.')
        setStatus('error')
        setTimeout(() => navigate('/login'), 2000)
      }
    }

    handleOAuthCallback()
  }, [searchParams, onLogin, navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-vibrant-purple via-vibrant-pink to-vibrant-blue flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="card-colored p-8 text-center backdrop-blur-sm">
          {status === 'processing' && (
            <>
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-gradient-to-r from-vibrant-purple to-vibrant-pink rounded-full">
                  <Loader className="h-12 w-12 text-white animate-spin" />
                </div>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-vibrant-purple to-vibrant-pink bg-clip-text text-transparent mb-2">
                Completing Authentication
              </h2>
              <p className="text-gray-600">
                Please wait while we complete your Slack authentication...
              </p>
              <div className="mt-4 text-sm text-vibrant-purple">
                This may take a few seconds...
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-gradient-to-r from-vibrant-emerald to-vibrant-teal rounded-full">
                  <CheckCircle className="h-12 w-12 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-vibrant-emerald to-vibrant-teal bg-clip-text text-transparent mb-2">
                Authentication Successful!
              </h2>
              <p className="text-gray-600">
                Welcome! Redirecting to your dashboard...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-gradient-to-r from-vibrant-rose to-vibrant-red rounded-full">
                  <XCircle className="h-12 w-12 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-vibrant-rose to-vibrant-red bg-clip-text text-transparent mb-2">
                Authentication Failed
              </h2>
              <p className="text-gray-600 mb-4">
                {error || 'An error occurred during authentication.'}
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    clearOAuthState()
                    navigate('/login')
                  }}
                  className="btn-primary w-full"
                >
                  Try Again (Clear OAuth State)
                </button>
                <p className="text-sm text-vibrant-purple">
                  Or wait to be redirected automatically...
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default OAuthCallback
