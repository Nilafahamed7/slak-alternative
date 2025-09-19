import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, XCircle, Loader } from 'lucide-react'
import { exchangeCodeForToken, clearOAuthState } from '../services/slackService'

const OAuthCallback = ({ onLogin }) => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('processing') // processing, success, error
  const [error, setError] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const handleOAuthCallback = async () => {
      // Prevent multiple simultaneous processing
      if (isProcessing) {
        console.log('OAuth callback already processing, skipping...')
        return
      }
      
      setIsProcessing(true)
      
      try {
        const code = searchParams.get('code')
        const state = searchParams.get('state')
        const error = searchParams.get('error')

        console.log('OAuth callback params:', { 
          code: code ? `${code.substring(0, 10)}...` : 'missing', 
          state: state ? 'present' : 'missing', 
          error 
        })

        // Check for OAuth errors first
        if (error) {
          console.error('OAuth error from Slack:', error)
          setError(`OAuth error: ${error}`)
          setStatus('error')
          setTimeout(() => navigate('/login'), 3000)
          return
        }

        // Check for missing code
        if (!code) {
          console.error('Missing authorization code')
          setError('Missing authorization code')
          setStatus('error')
          setTimeout(() => navigate('/login'), 3000)
          return
        }

        // Check if we've already processed this code
        const processedCode = localStorage.getItem('processed_oauth_code')
        if (processedCode === code) {
          console.error('Code already processed, redirecting to login')
          setError('OAuth code has already been processed. Please try logging in again.')
          setStatus('error')
          setTimeout(() => navigate('/login'), 3000)
          return
        }

        // Add a small delay to prevent flash
        await new Promise(resolve => setTimeout(resolve, 500))

        // Exchange code for access token
        console.log('Exchanging code for token...')
        const tokenData = await exchangeCodeForToken(code, state)
        
        if (!tokenData || !tokenData.access_token) {
          throw new Error('Invalid token response from Slack')
        }

        console.log('Token exchange successful')
        setStatus('success')
        
        // Call onLogin with the access token
        onLogin(tokenData.access_token)
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard')
        }, 1500)

      } catch (err) {
        console.error('OAuth callback error:', err)
        
        // Handle specific error types
        let errorMessage = err.message
        if (err.message.includes('invalid_code') || err.message.includes('already been used') || err.message.includes('expired')) {
          errorMessage = 'OAuth code has expired or been used. This is normal - please try logging in again.'
        }
        
        setError(errorMessage)
        setStatus('error')
        
        // Redirect to login after error with a shorter delay
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      } finally {
        setIsProcessing(false)
      }
    }

    // Add a small delay before starting to prevent race conditions
    const timer = setTimeout(handleOAuthCallback, 100)
    return () => clearTimeout(timer)
  }, [searchParams, onLogin, navigate, isProcessing])

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
              <div className="mt-4 text-sm text-gray-500">
                This may take a few seconds...
              </div>
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
                <p className="text-sm text-gray-500">
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
