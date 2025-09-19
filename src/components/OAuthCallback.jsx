import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, XCircle, Loader } from 'lucide-react'
import { exchangeCodeForToken } from '../services/slackService'

const OAuthCallback = ({ onLogin }) => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('processing') // processing, success, error
  const [error, setError] = useState('')

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const code = searchParams.get('code')
        const state = searchParams.get('state')
        const error = searchParams.get('error')

        console.log('OAuth callback params:', { code: code ? 'present' : 'missing', state: state ? 'present' : 'missing', error })

        if (error) {
          throw new Error(`OAuth error: ${error}`)
        }

        if (!code) {
          throw new Error('Missing authorization code')
        }

        // Exchange code for access token
        const tokenData = await exchangeCodeForToken(code, state)
        
        setStatus('success')
        
        // Call onLogin with the access token
        onLogin(tokenData.access_token)
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard')
        }, 2000)

      } catch (err) {
        console.error('OAuth callback error:', err)
        setError(err.message)
        setStatus('error')
        
        // Redirect to login after error
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      }
    }

    handleOAuthCallback()
  }, [searchParams, onLogin, navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slack-purple to-purple-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="card p-8 text-center">
          {status === 'processing' && (
            <>
              <div className="flex justify-center mb-4">
                <Loader className="h-12 w-12 text-slack-purple animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Completing Authentication
              </h2>
              <p className="text-gray-600">
                Please wait while we complete your Slack authentication...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Authentication Successful!
              </h2>
              <p className="text-gray-600">
                You have been successfully authenticated with Slack.
                Redirecting to dashboard...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="flex justify-center mb-4">
                <XCircle className="h-12 w-12 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Authentication Failed
              </h2>
              <p className="text-gray-600 mb-4">
                {error || 'An error occurred during authentication.'}
              </p>
              <p className="text-sm text-gray-500">
                Redirecting to login page...
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default OAuthCallback
