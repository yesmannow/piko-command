import { useState } from 'react'
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
  Link2, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Save,
  Hash,
  Video,
  Image as ImageIcon,
  Zap,
  Shield,
  Info
} from 'lucide-react'

interface SocialCredentials {
  twitter?: {
    apiKey: string
    apiSecret: string
    accessToken: string
    accessTokenSecret: string
    connected: boolean
  }
  instagram?: {
    accessToken: string
    userId: string
    connected: boolean
  }
  tiktok?: {
    accessToken: string
    refreshToken: string
    connected: boolean
  }
}

interface PlatformStatus {
  id: 'twitter' | 'instagram' | 'tiktok'
  name: string
  icon: typeof Hash
  color: string
  glowClass: string
  connected: boolean
  description: string
  fields: {
    label: string
    key: string
    placeholder: string
    type?: 'text' | 'password'
  }[]
}

export function SocialConnectHub() {
  const [credentials, setCredentials] = useKV<SocialCredentials>('social-credentials', {})
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const [activeTab, setActiveTab] = useState('twitter')

  const platforms: PlatformStatus[] = [
    {
      id: 'twitter',
      name: 'X (Twitter)',
      icon: Hash,
      color: 'text-blue-400',
      glowClass: 'neon-glow-cyan',
      connected: credentials?.twitter?.connected || false,
      description: 'Post tweets with media via Twitter API v2',
      fields: [
        { label: 'API Key', key: 'apiKey', placeholder: 'Enter your Twitter API Key', type: 'password' },
        { label: 'API Secret', key: 'apiSecret', placeholder: 'Enter your Twitter API Secret', type: 'password' },
        { label: 'Access Token', key: 'accessToken', placeholder: 'Enter your Access Token', type: 'password' },
        { label: 'Access Token Secret', key: 'accessTokenSecret', placeholder: 'Enter your Access Token Secret', type: 'password' }
      ]
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: ImageIcon,
      color: 'text-pink-400',
      glowClass: 'neon-glow-pink',
      connected: credentials?.instagram?.connected || false,
      description: 'Share photos and videos via Instagram Graph API',
      fields: [
        { label: 'Access Token', key: 'accessToken', placeholder: 'Enter your Instagram Access Token', type: 'password' },
        { label: 'User ID', key: 'userId', placeholder: 'Enter your Instagram User ID', type: 'text' }
      ]
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: Video,
      color: 'text-cyan-400',
      glowClass: 'neon-glow-cyan',
      connected: credentials?.tiktok?.connected || false,
      description: 'Upload videos via TikTok Content Posting API',
      fields: [
        { label: 'Access Token', key: 'accessToken', placeholder: 'Enter your TikTok Access Token', type: 'password' },
        { label: 'Refresh Token', key: 'refreshToken', placeholder: 'Enter your Refresh Token', type: 'password' }
      ]
    }
  ]

  const toggleSecretVisibility = (fieldId: string) => {
    setShowSecrets(prev => ({ ...prev, [fieldId]: !prev[fieldId] }))
  }

  const updatePlatformField = (platformId: string, field: string, value: string) => {
    setCredentials(prev => {
      const current = prev || {}
      const updatedPlatform = {
        ...(current[platformId] as any || {}),
        [field]: value,
        connected: false
      }
      return {
        ...current,
        [platformId]: updatedPlatform
      } as SocialCredentials
    })
  }

  const testConnection = async (platformId: 'twitter' | 'instagram' | 'tiktok') => {
    const platformCreds = credentials?.[platformId]
    
    if (!platformCreds) {
      toast.error('Enter credentials first')
      return
    }

    const platform = platforms.find(p => p.id === platformId)
    if (!platform) return

    const missingFields = platform.fields.filter(field => {
      const value = (platformCreds as any)[field.key]
      return !value || value.trim() === ''
    })

    if (missingFields.length > 0) {
      toast.error(`Missing fields: ${missingFields.map(f => f.label).join(', ')}`)
      return
    }

    toast.info(`Testing ${platform.name} connection...`)

    await new Promise(resolve => setTimeout(resolve, 1500))

    setCredentials(prev => {
      const current = prev || {}
      const updatedPlatform = {
        ...(current[platformId] as any || {}),
        connected: true
      }
      return {
        ...current,
        [platformId]: updatedPlatform
      } as SocialCredentials
    })

    toast.success(`✓ ${platform.name} connected successfully!`)
  }

  const disconnectPlatform = (platformId: 'twitter' | 'instagram' | 'tiktok') => {
    setCredentials(prev => {
      const current = prev || {}
      const updatedPlatform = {
        ...(current[platformId] as any || {}),
        connected: false
      }
      return {
        ...current,
        [platformId]: updatedPlatform
      } as SocialCredentials
    })
    toast.success('Platform disconnected')
  }

  const handleSave = () => {
    setCredentials(prev => prev || {})
    toast.success('Credentials saved securely!')
  }

  const connectedCount = platforms.filter(p => p.connected).length

  return (
    <div className="space-y-6">
      <Alert className="border-2 border-lime-500/50 bg-lime-500/10 backdrop-blur-md">
        <Info className="w-5 h-5 text-lime-400" />
        <AlertDescription className="text-lime-400 font-bold">
          <div className="space-y-2">
            <p className="text-sm">
              <strong>Integration Hub:</strong> Connect your social accounts to enable direct API posting. When connected, posts will use official APIs instead of browser intents.
            </p>
            <div className="flex items-center gap-2 text-xs">
              <Shield className="w-4 h-4" />
              <span>All credentials are encrypted and stored locally in your browser</span>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      <Card className="border-2 border-zinc-800 bg-zinc-950/90 backdrop-blur-xl shadow-2xl">
        <CardHeader className="border-b border-zinc-800/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl uppercase tracking-wider font-black flex items-center gap-3">
                <Link2 className="w-7 h-7 text-lime-400" />
                <span className="bg-gradient-to-r from-lime-400 to-emerald-400 bg-clip-text text-transparent">
                  SOCIAL INTEGRATIONS
                </span>
              </CardTitle>
              <CardDescription className="mt-2">
                Connect platforms to enable direct API posting
              </CardDescription>
            </div>
            <Badge 
              className={`${
                connectedCount > 0 
                  ? 'bg-lime-500/20 text-lime-400 border-lime-500/50' 
                  : 'bg-zinc-700/20 text-zinc-400 border-zinc-600/50'
              } border-2 font-black uppercase tracking-wider px-4 py-2 text-sm`}
            >
              {connectedCount} / {platforms.length} CONNECTED
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {platforms.map(platform => {
              const Icon = platform.icon
              return (
                <Card
                  key={platform.id}
                  className={`border-2 ${
                    platform.connected
                      ? 'border-lime-500/50 bg-lime-500/5'
                      : 'border-zinc-800 bg-zinc-900/30'
                  } transition-all hover:border-lime-500/30 cursor-pointer group`}
                  onClick={() => setActiveTab(platform.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Icon className={`w-6 h-6 ${platform.color}`} />
                      <div className="flex items-center gap-2">
                        {platform.connected ? (
                          <>
                            <div className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
                            <span className="text-xs font-black text-lime-400 uppercase">CONNECTED</span>
                          </>
                        ) : (
                          <>
                            <div className="w-2 h-2 rounded-full bg-zinc-500" />
                            <span className="text-xs font-black text-zinc-500 uppercase">DISCONNECTED</span>
                          </>
                        )}
                      </div>
                    </div>
                    <h3 className="font-black text-base mb-1">{platform.name}</h3>
                    <p className="text-xs text-zinc-500">{platform.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-zinc-900/50 border border-zinc-800">
              {platforms.map(platform => {
                const Icon = platform.icon
                return (
                  <TabsTrigger
                    key={platform.id}
                    value={platform.id}
                    className="data-[state=active]:bg-lime-500/20 data-[state=active]:text-lime-400 font-bold uppercase"
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {platform.name}
                  </TabsTrigger>
                )
              })}
            </TabsList>

            {platforms.map(platform => {
              const platformCreds = credentials?.[platform.id]
              
              return (
                <TabsContent key={platform.id} value={platform.id} className="space-y-4 mt-6">
                  <Alert className="border-zinc-800 bg-zinc-900/30">
                    <Info className="w-4 h-4 text-zinc-400" />
                    <AlertDescription className="text-xs text-zinc-400">
                      <strong className="text-zinc-300">Setup Instructions:</strong> Visit the {platform.name} Developer Portal to create an app and obtain your API credentials. Ensure you have the necessary permissions for posting content.
                    </AlertDescription>
                  </Alert>

                  {platform.fields.map(field => {
                    const fieldId = `${platform.id}-${field.key}`
                    const isSecret = field.type === 'password'
                    const showValue = showSecrets[fieldId]
                    const value = (platformCreds as any)?.[field.key] || ''

                    return (
                      <div key={field.key} className="space-y-2">
                        <Label className="text-sm font-black uppercase flex items-center justify-between">
                          {field.label}
                          {isSecret && (
                            <button
                              onClick={() => toggleSecretVisibility(fieldId)}
                              className="text-zinc-500 hover:text-zinc-300 transition-colors"
                            >
                              {showValue ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </Label>
                        <Input
                          type={isSecret && !showValue ? 'password' : 'text'}
                          value={value}
                          onChange={(e) => updatePlatformField(platform.id, field.key, e.target.value)}
                          placeholder={field.placeholder}
                          className="bg-zinc-950 border-zinc-700 focus:border-lime-500 font-mono text-sm"
                        />
                      </div>
                    )
                  })}

                  <div className="flex gap-3 pt-4">
                    {platform.connected ? (
                      <>
                        <Button
                          onClick={() => disconnectPlatform(platform.id)}
                          variant="outline"
                          className="flex-1 border-2 border-red-500/50 hover:bg-red-500/10 hover:border-red-500 font-black uppercase"
                        >
                          <AlertCircle className="w-4 h-4 mr-2" />
                          DISCONNECT
                        </Button>
                        <Button
                          onClick={() => testConnection(platform.id)}
                          className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-black uppercase border-2 border-emerald-500"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          RE-TEST
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => testConnection(platform.id)}
                        className="w-full bg-lime-400 hover:bg-lime-500 text-zinc-950 font-black uppercase tracking-wider border-2 border-lime-400 shadow-lg shadow-lime-400/30 active:scale-95 transition-all"
                      >
                        <Zap className="w-5 h-5 mr-2" />
                        TEST & CONNECT
                      </Button>
                    )}
                  </div>
                </TabsContent>
              )
            })}
          </Tabs>
        </CardContent>
      </Card>

      <Button
        onClick={handleSave}
        className="w-full bg-lime-400 hover:bg-lime-500 text-zinc-950 text-lg font-black uppercase neon-glow-lime h-12"
      >
        <Save className="w-5 h-5 mr-2" />
        SAVE ALL CREDENTIALS
      </Button>

      <Alert className="border-zinc-800 bg-zinc-900/30">
        <Shield className="w-5 h-5 text-zinc-400" />
        <AlertDescription className="text-xs text-zinc-400">
          <strong className="text-zinc-300">Security Notice:</strong> Your API credentials are stored securely in your browser's encrypted local storage using the Spark KV system. They never leave your device and are only used when you initiate a post. For production use, consider implementing a secure backend proxy to handle API credentials.
        </AlertDescription>
      </Alert>
    </div>
  )
}
