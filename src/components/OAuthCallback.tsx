import { useEffect, useState } from 'react'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

export function OAuthCallback() {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [message, setMessage] = useState('Processing OAuth callback...')

  useEffect(() => {
    const handleCallback = () => {
      try {
        const params = new URLSearchParams(window.location.search)
        const code = params.get('code')
        const state = params.get('state')
        const error = params.get('error')
        const errorDescription = params.get('error_description')

        if (error) {
          setStatus('error')
          setMessage(errorDescription || `OAuth error: ${error}`)
          
          setTimeout(() => {
            window.close()
          }, 3000)
          return
        }

        if (!code || !state) {
          setStatus('error')
          setMessage('Invalid callback - missing code or state parameter')
          
          setTimeout(() => {
            window.close()
          }, 3000)
          return
        }

        const platform = sessionStorage.getItem('oauth_platform') || 'unknown'

        if (window.opener) {
          window.opener.postMessage({
            type: 'oauth_callback',
            code,
            state,
            platform
          }, window.location.origin)

          setStatus('success')
          setMessage(`Successfully connected to ${platform}!`)

          setTimeout(() => {
            window.close()
          }, 2000)
        } else {
          setStatus('error')
          setMessage('Parent window not found - please try again')
          
          setTimeout(() => {
            window.close()
          }, 3000)
        }
      } catch (err) {
        setStatus('error')
        setMessage(err instanceof Error ? err.message : 'Unknown error occurred')
        
        setTimeout(() => {
          window.close()
        }, 3000)
      }
    }

    handleCallback()
  }, [])

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="border-2 border-zinc-800 bg-zinc-900/90 backdrop-blur-xl rounded-lg p-8 shadow-2xl">
          <div className="flex flex-col items-center text-center space-y-4">
            {status === 'processing' && (
              <>
                <Loader2 className="w-16 h-16 text-lime-400 animate-spin" />
                <h1 className="text-2xl font-black uppercase tracking-wider text-lime-400">
                  Processing...
                </h1>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckCircle className="w-16 h-16 text-lime-400" />
                <h1 className="text-2xl font-black uppercase tracking-wider text-lime-400">
                  Connection Successful!
                </h1>
              </>
            )}

            {status === 'error' && (
              <>
                <AlertCircle className="w-16 h-16 text-red-400" />
                <h1 className="text-2xl font-black uppercase tracking-wider text-red-400">
                  Connection Failed
                </h1>
              </>
            )}

            <p className="text-zinc-400 text-sm">{message}</p>

            {status !== 'processing' && (
              <p className="text-xs text-zinc-600">This window will close automatically...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
