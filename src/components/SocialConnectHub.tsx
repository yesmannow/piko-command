import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { 
  Hash,
  Image as ImageIcon,
  Video,
  Eye,
  EyeOff,
  Link2,
  CheckCircle,
  AlertCircle,
  Info,
  LogIn,
  LogOut,
  Shield,
  ExternalLink,
  Settings
} from 'lucide-react'
import { AuthService, type AuthConfig, type PlatformConnection } from '@/lib/auth'
import { OAuthEnvConfig, hasEnvConfig } from '@/lib/oauthEnvConfig'

interface SocialConnections {
  twitter?: PlatformConnection
  instagram?: PlatformConnection
  tiktok?: PlatformConnection
  facebook?: PlatformConnection
  linkedin?: PlatformConnection
}

const PLATFORM_CONFIG = [
  {
    id: 'twitter' as const,
    name: 'X (Twitter)',
    icon: Hash,
    color: 'text-blue-400',
    glowClass: 'neon-glow-cyan',
    description: 'Post tweets directly via Twitter API v2',
    credentialFields: [
      { label: 'Client ID', key: 'clientId', placeholder: 'Your Twitter Client ID', type: 'text' as const },
      { label: 'Client Secret', key: 'clientSecret', placeholder: 'Your Twitter Client Secret', type: 'password' as const }
    ]
  },
  {
    id: 'instagram' as const,
    name: 'Instagram',
    icon: ImageIcon,
    color: 'text-pink-400',
    glowClass: 'neon-glow-pink',
    description: 'Post images and videos via Instagram Graph API',
    credentialFields: [
      { label: 'Client ID', key: 'clientId', placeholder: 'Your Instagram Client ID', type: 'text' as const },
      { label: 'Client Secret', key: 'clientSecret', placeholder: 'Your Instagram Client Secret', type: 'password' as const }
    ]
  },
  {
    id: 'tiktok' as const,
    name: 'TikTok',
    icon: Video,
    color: 'text-cyan-400',
    glowClass: 'neon-glow-cyan',
    description: 'Upload videos via TikTok Content Posting API',
    credentialFields: [
      { label: 'Client Key', key: 'clientId', placeholder: 'Your TikTok Client Key', type: 'text' as const },
      { label: 'Client Secret', key: 'clientSecret', placeholder: 'Your TikTok Client Secret', type: 'password' as const }
    ]
  },
  {
    id: 'facebook' as const,
    name: 'Facebook',
    icon: ExternalLink,
    color: 'text-blue-500',
    glowClass: 'neon-glow-cyan',
    description: 'Post to Facebook Pages via Graph API',
    credentialFields: [
      { label: 'App ID', key: 'clientId', placeholder: 'Your Facebook App ID', type: 'text' as const },
      { label: 'App Secret', key: 'clientSecret', placeholder: 'Your Facebook App Secret', type: 'password' as const }
    ]
  },
  {
    id: 'linkedin' as const,
    name: 'LinkedIn',
    icon: ExternalLink,
    color: 'text-blue-600',
    glowClass: 'neon-glow-cyan',
    description: 'Share posts via LinkedIn API',
    credentialFields: [
      { label: 'Client ID', key: 'clientId', placeholder: 'Your LinkedIn Client ID', type: 'text' as const },
      { label: 'Client Secret', key: 'clientSecret', placeholder: 'Your LinkedIn Client Secret', type: 'password' as const }
    ]
  }
]

export function SocialConnectHub() {
  const [connections, setConnections] = useKV<SocialConnections>('social-connections', {})
  const [authConfig, setAuthConfig] = useKV<AuthConfig>('oauth-config', {})
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const [selectedPlatform, setSelectedPlatform] = useState<string>('twitter')
  const [isConnecting, setIsConnecting] = useState<string | null>(null)

  useEffect(() => {
    const mergedConfig: AuthConfig = {}
    
    Object.keys(OAuthEnvConfig).forEach((platform) => {
      const envConfig = OAuthEnvConfig[platform as keyof typeof OAuthEnvConfig]
      const savedConfig = authConfig?.[platform as keyof AuthConfig]
      
      mergedConfig[platform as keyof AuthConfig] = {
        clientId: savedConfig?.clientId || envConfig.clientId,
        clientSecret: savedConfig?.clientSecret || envConfig.clientSecret
      }
    })

    if (JSON.stringify(mergedConfig) !== JSON.stringify(authConfig)) {
      setAuthConfig(mergedConfig)
    }
  }, [])

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'oauth_callback') {
        const { code, state, platform } = event.data
        
        try {
          setIsConnecting(platform)
          const credentials = await AuthService.handleCallback(platform, code, state)
          
          setConnections(prev => ({
            ...prev,
            [platform]: {
              platform,
              connected: true,
              credentials,
              lastConnected: Date.now()
            }
          }))

          toast.success(`${platform.toUpperCase()} connected successfully!`)
        } catch (error) {
          toast.error(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
          
          setConnections(prev => ({
            ...prev,
            [platform]: {
              platform,
              connected: false,
              error: error instanceof Error ? error.message : 'Connection failed'
            }
          }))
        } finally {
          setIsConnecting(null)
        }
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [authConfig, setConnections])

  const handleConnect = async (platformId: string) => {
    const config = authConfig || {}
    const platformConfig = config[platformId as keyof AuthConfig]

    if (!platformConfig?.clientId || !platformConfig?.clientSecret) {
      toast.error('Please configure API credentials first')
      return
    }

    try {
      setIsConnecting(platformId)
      AuthService.updateConfig(config)
      AuthService.initiateOAuth(platformId as keyof AuthConfig)
      toast.info(`Opening ${platformId} authorization window...`)
    } catch (error) {
      toast.error(`Failed to initiate OAuth: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setIsConnecting(null)
    }
  }

  const handleDisconnect = (platformId: string) => {
    setConnections(prev => ({
      ...prev,
      [platformId]: {
        platform: platformId as any,
        connected: false
      }
    }))
    toast.success(`${platformId.toUpperCase()} disconnected`)
  }

  const updateAuthConfig = (platformId: string, field: string, value: string) => {
    setAuthConfig(prev => ({
      ...prev,
      [platformId]: {
        ...(prev?.[platformId as keyof AuthConfig] || {}),
        [field]: value
      }
    }))
  }

  const toggleSecretVisibility = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const connectedCount = Object.values(connections || {}).filter(c => c?.connected).length
  const totalPlatforms = PLATFORM_CONFIG.length

  return (
    <div className="space-y-6">
      <Alert className="border-2 border-lime-500/30 bg-lime-500/5">
        <Shield className="w-5 h-5 text-lime-400" />
        <AlertDescription className="text-lime-100">
          <strong className="font-black uppercase tracking-wide">OAuth Integration Hub</strong>
          <p className="text-sm text-zinc-400 mt-1">
            Connect your social accounts with industry-standard OAuth 2.0. No passwords stored locally.
          </p>
        </AlertDescription>
      </Alert>

      <Card className="border-2 border-zinc-800 bg-zinc-950/90 backdrop-blur-xl shadow-2xl">
        <CardHeader className="border-b border-zinc-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link2 className="w-7 h-7 text-lime-400" />
              <div>
                <CardTitle className="text-2xl uppercase tracking-wider font-black bg-gradient-to-r from-lime-400 to-emerald-400 bg-clip-text text-transparent">
                  INTEGRATION HUB
                </CardTitle>
                <CardDescription className="text-xs uppercase tracking-widest font-bold text-zinc-500 mt-1">
                  Professional OAuth · Secure Token Management
                </CardDescription>
              </div>
            </div>
            <Badge
              className={`${
                connectedCount === totalPlatforms
                  ? 'bg-lime-400/20 text-lime-400 border-lime-400/50'
                  : 'bg-zinc-700/20 text-zinc-400 border-zinc-600/50'
              } border-2 font-black uppercase tracking-wider px-4 py-2 text-sm`}
            >
              {connectedCount} / {totalPlatforms} CONNECTED
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
            {PLATFORM_CONFIG.map(platform => {
              const Icon = platform.icon
              const connection = connections?.[platform.id]
              const isConnected = connection?.connected || false

              return (
                <Card
                  key={platform.id}
                  className={`border-2 transition-all cursor-pointer ${
                    isConnected
                      ? 'border-lime-500/50 bg-lime-500/5 hover:border-lime-400'
                      : 'border-zinc-700 bg-zinc-900/30 hover:border-zinc-600'
                  }`}
                  onClick={() => setSelectedPlatform(platform.id)}
                >
                  <CardContent className="p-4 text-center">
                    <div className={`w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center ${
                      isConnected ? 'bg-lime-500/20' : 'bg-zinc-800'
                    }`}>
                      <Icon className={`w-6 h-6 ${isConnected ? 'text-lime-400' : platform.color}`} />
                    </div>
                    <p className="font-black text-xs uppercase tracking-wide mb-2">{platform.name}</p>
                    <div className="flex items-center justify-center gap-1">
                      {isConnected ? (
                        <>
                          <div className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
                          <span className="text-xs font-bold text-lime-400 uppercase">Connected</span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 rounded-full bg-zinc-600" />
                          <span className="text-xs font-bold text-zinc-500 uppercase">Disconnected</span>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <Tabs value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <TabsList className="grid grid-cols-5 w-full bg-zinc-900/50 border border-zinc-800">
              {PLATFORM_CONFIG.map(platform => (
                <TabsTrigger
                  key={platform.id}
                  value={platform.id}
                  className="data-[state=active]:bg-lime-400 data-[state=active]:text-zinc-950 font-black uppercase tracking-wide text-xs"
                >
                  {platform.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {PLATFORM_CONFIG.map(platform => {
              const connection = connections?.[platform.id]
              const isConnected = connection?.connected || false
              const platformAuthConfig = authConfig?.[platform.id]

              return (
                <TabsContent key={platform.id} value={platform.id} className="space-y-4 mt-4">
                  <Alert className="border-2 border-zinc-800 bg-zinc-900/30">
                    <Info className="w-4 h-4 text-zinc-400" />
                    <AlertDescription className="text-sm text-zinc-400">
                      <strong className="text-zinc-200">{platform.description}</strong>
                      <p className="text-xs mt-1">Configure your OAuth credentials below to enable direct API posting.</p>
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    {platform.credentialFields.map(field => {
                      const fieldKey = `${platform.id}_${field.key}`
                      const isSecret = field.type === 'password'
                      const showValue = showSecrets[fieldKey]
                      const currentValue = platformAuthConfig?.[field.key as keyof typeof platformAuthConfig] as string || ''
                      const isFromEnv = hasEnvConfig(platform.id) && !connections?.[platform.id]?.connected

                      return (
                        <div key={field.key} className="space-y-2">
                          <Label className="text-xs uppercase tracking-widest font-black text-zinc-400 flex items-center gap-2">
                            {field.label}
                            {isFromEnv && currentValue && (
                              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50 text-xs font-mono">
                                ENV
                              </Badge>
                            )}
                          </Label>
                          <div className="relative">
                            <Input
                              type={isSecret && !showValue ? 'password' : 'text'}
                              value={currentValue}
                              onChange={(e) => updateAuthConfig(platform.id, field.key, e.target.value)}
                              placeholder={field.placeholder}
                              className="bg-zinc-950 border-zinc-700 focus:border-lime-500 font-mono text-sm pr-10"
                              disabled={isConnected}
                            />
                            {isSecret && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleSecretVisibility(fieldKey)}
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                              >
                                {showValue ? (
                                  <EyeOff className="w-4 h-4 text-zinc-500" />
                                ) : (
                                  <Eye className="w-4 h-4 text-zinc-500" />
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-zinc-800">
                    {isConnected ? (
                      <>
                        <div className="flex-1 p-3 rounded-lg border-2 border-lime-500/30 bg-lime-500/5">
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle className="w-4 h-4 text-lime-400" />
                            <span className="text-sm font-black uppercase text-lime-400">Connected</span>
                          </div>
                          {connection?.credentials?.username && (
                            <p className="text-xs text-zinc-500">@{connection.credentials.username}</p>
                          )}
                          {connection?.lastConnected && (
                            <p className="text-xs text-zinc-600">
                              {new Date(connection.lastConnected).toLocaleString()}
                            </p>
                          )}
                        </div>
                        <Button
                          onClick={() => handleDisconnect(platform.id)}
                          variant="outline"
                          className="border-2 border-red-500/50 hover:bg-red-500/10 hover:border-red-500 font-black uppercase"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Disconnect
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => handleConnect(platform.id)}
                        disabled={
                          !platformAuthConfig?.clientId ||
                          !platformAuthConfig?.clientSecret ||
                          isConnecting === platform.id
                        }
                        className="w-full bg-lime-400 hover:bg-lime-500 text-zinc-950 font-black uppercase tracking-wider border-2 border-lime-400 shadow-lg shadow-lime-400/30 active:scale-95 transition-all"
                      >
                        {isConnecting === platform.id ? (
                          <>
                            <Settings className="w-5 h-5 mr-2 animate-spin" />
                            CONNECTING...
                          </>
                        ) : (
                          <>
                            <LogIn className="w-5 h-5 mr-2" />
                            CONNECT {platform.name.toUpperCase()}
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  {connection?.error && !isConnected && (
                    <Alert className="border-2 border-red-500/50 bg-red-500/10">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <AlertDescription className="text-red-400 text-sm">
                        <strong>Connection Error:</strong> {connection.error}
                      </AlertDescription>
                    </Alert>
                  )}
                </TabsContent>
              )
            })}
          </Tabs>
        </CardContent>
      </Card>

      <Alert className="border-2 border-zinc-800 bg-zinc-900/30">
        <Info className="w-5 h-5 text-zinc-400" />
        <AlertDescription className="text-xs text-zinc-500">
          <strong className="text-zinc-300 font-black uppercase tracking-wide">Setup Instructions:</strong>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Create a developer app on each platform's developer portal</li>
            <li>Set OAuth redirect URI to: <code className="bg-zinc-800 px-1 rounded text-lime-400">{window.location.origin}/oauth/callback</code></li>
            <li>Copy Client ID and Client Secret to the fields above</li>
            <li>Click CONNECT to authorize PIKO COMMAND</li>
            <li>Once connected, posts will use official APIs instead of browser intents</li>
          </ol>
        </AlertDescription>
      </Alert>
    </div>
  )
}
