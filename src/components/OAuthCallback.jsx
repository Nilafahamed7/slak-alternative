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
        return
      }
      
      setIsProcessing(true)
      
      try {
        const code = searchParams.get('code')
        const state = searchParams.get('state')
        const error = searchParams.get('error')

        // Check for OAuth errors first
        if (error) {
          setError(`OAuth error: ${error}`)
          setStatus('error')
          setTimeout(() => navigate('/login'), 3000)
          return
        }

        // Check for missing code
        if (!code) {
          setError('Missing authorization code')
          setStatus('error')
          setTimeout(() => navigate('/login'), 3000)
          return
        }

        // Check if we've already processed this code
        const processedCode = localStorage.getItem('processed_oauth_code')
        if (processedCode === code) {
          setError('OAuth code has already been processed. Please try logging in again.')
          setStatus('error')
          setTimeout(() => navigate('/login'), 3000)
          return
        }

        // If we have a valid code, show success immediately (optimistic UI)
        setStatus('success')
        
        // Exchange code for access token
        const tokenData = await exchangeCodeForToken(code, state)
        
        if (!tokenData || !tokenData.access_token) {
          throw new Error('Invalid token response from Slack')
        }
        
        // Call onLogin with the access token
        onLogin(tokenData.access_token)
        
        // Redirect to dashboard very quickly
        setTimeout(() => {
          navigate('/dashboard')
        }, 500)

      } catch (err) {
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

    // Start immediately without delay
    handleOAuthCallback()
  }, [searchParams, onLogin, navigate, isProcessing])

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
