import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { toast } from 'sonner'
import { 
  Instagram, 
  Youtube, 
  CheckCircle, 
  Eye, 
  EyeOff, 
  Info, 
  ChevronDown,
  LogIn,
  LogOut,
  Music,
  Sparkles,
  Facebook
} from 'lucide-react'

export interface SocialMediaTokens {
  instagram?: {
    accessToken: string
    userId: string
    expiresAt: number
    username?: string
  }
  tiktok?: {
    accessToken: string
    refreshToken: string
    openId: string
    expiresAt: number
    username?: string
  }
  youtube?: {
    accessToken: string
    refreshToken: string
    channelId: string
    expiresAt: number
    channelName?: string
  }
  twitter?: {
    accessToken: string
    accessTokenSecret: string
    userId: string
    username?: string
  }
  facebook?: {
    accessToken: string
    userId: string
    expiresAt: number
    username?: string
    pageId?: string
    pageName?: string
  }
}

export interface SocialMediaAppCredentials {
  instagram?: {
    appId: string
    appSecret: string
    redirectUri: string
  }
  tiktok?: {
    clientKey: string
    clientSecret: string
    redirectUri: string
  }
  youtube?: {
    clientId: string
    clientSecret: string
    redirectUri: string
  }
  twitter?: {
    apiKey: string
    apiSecret: string
    bearerToken: string
  }
  facebook?: {
    appId: string
    appSecret: string
    redirectUri: string
  }
}

export function SocialMediaAuth() {
  const [appCredentials, setAppCredentials] = useKV<SocialMediaAppCredentials>('social-app-credentials', {})
  const [tokens, setTokens] = useKV<SocialMediaTokens>('social-tokens', {})
  const [showSecrets, setShowSecrets] = useState({
    instagramSecret: false,
    tiktokSecret: false,
    youtubeSecret: false,
    twitterSecret: false,
    facebookSecret: false
  })
  const [showSetupGuide, setShowSetupGuide] = useState(false)

  // OAuth callback handler for future use when OAuth flow is implemented
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleOAuthCallback = async (platform: string, code: string) => {
    try {
      switch (platform) {
        case 'instagram':
          await handleInstagramCallback(code)
          break
        case 'tiktok':
          await handleTikTokCallback(code)
          break
        case 'youtube':
          await handleYouTubeCallback(code)
          break
        case 'facebook':
          await handleFacebookCallback(code)
          break
      }
    } catch (error) {
      toast.error(`${platform} authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsConnecting(null)
    }
  }

  const handleInstagramCallback = async (code: string) => {
    if (!appCredentials?.instagram) {
      throw new Error('Instagram credentials not configured')
    }

    const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: appCredentials.instagram.appId,
        client_secret: appCredentials.instagram.appSecret,
        grant_type: 'authorization_code',
        redirect_uri: appCredentials.instagram.redirectUri,
        code
      })
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange Instagram code for token')
    }

    const tokenData = await tokenResponse.json()

    const longLivedResponse = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${appCredentials.instagram.appSecret}&access_token=${tokenData.access_token}`
    )

    const longLivedData = await longLivedResponse.json()

    setTokens((current) => ({
      ...current,
      instagram: {
        accessToken: longLivedData.access_token,
        userId: tokenData.user_id,
        expiresAt: Date.now() + (longLivedData.expires_in * 1000),
        username: tokenData.username
      }
    }))

    toast.success('Instagram connected successfully!')
  }

  const handleTikTokCallback = async (code: string) => {
    if (!appCredentials?.tiktok) {
      throw new Error('TikTok credentials not configured')
    }

    const tokenResponse = await fetch('https://open-api.tiktok.com/oauth/access_token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: appCredentials.tiktok.clientKey,
        client_secret: appCredentials.tiktok.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: appCredentials.tiktok.redirectUri
      })
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange TikTok code for token')
    }

    const tokenData = await tokenResponse.json()

    if (tokenData.data) {
      setTokens((current) => ({
        ...current,
        tiktok: {
          accessToken: tokenData.data.access_token,
          refreshToken: tokenData.data.refresh_token,
          openId: tokenData.data.open_id,
          expiresAt: Date.now() + (tokenData.data.expires_in * 1000)
        }
      }))

      toast.success('TikTok connected successfully!')
    } else {
      throw new Error(tokenData.error?.message || 'TikTok authentication failed')
    }
  }

  const handleYouTubeCallback = async (code: string) => {
    if (!appCredentials?.youtube) {
      throw new Error('YouTube credentials not configured')
    }

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: appCredentials.youtube.clientId,
        client_secret: appCredentials.youtube.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: appCredentials.youtube.redirectUri
      })
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange YouTube code for token')
    }

    const tokenData = await tokenResponse.json()

    const channelResponse = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    })

    const channelData = await channelResponse.json()

    setTokens((current) => ({
      ...current,
      youtube: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        channelId: channelData.items?.[0]?.id || '',
        expiresAt: Date.now() + (tokenData.expires_in * 1000),
        channelName: channelData.items?.[0]?.snippet?.title
      }
    }))

    toast.success('YouTube connected successfully!')
  }

  const handleFacebookCallback = async (code: string) => {
    if (!appCredentials?.facebook) {
      throw new Error('Facebook credentials not configured')
    }

    const tokenUrl = new URL('https://graph.facebook.com/v18.0/oauth/access_token')
    tokenUrl.searchParams.append('client_id', appCredentials.facebook.appId)
    tokenUrl.searchParams.append('client_secret', appCredentials.facebook.appSecret)
    tokenUrl.searchParams.append('redirect_uri', appCredentials.facebook.redirectUri)
    tokenUrl.searchParams.append('code', code)

    const response = await fetch(tokenUrl.toString())

    if (!response.ok) {
      throw new Error('Failed to exchange Facebook code for token')
    }

    const tokenData = await response.json()

    const longLivedUrl = new URL('https://graph.facebook.com/v18.0/oauth/access_token')
    longLivedUrl.searchParams.append('grant_type', 'fb_exchange_token')
    longLivedUrl.searchParams.append('client_id', appCredentials.facebook.appId)
    longLivedUrl.searchParams.append('client_secret', appCredentials.facebook.appSecret)
    longLivedUrl.searchParams.append('fb_exchange_token', tokenData.access_token)

    const longLivedResponse = await fetch(longLivedUrl.toString())
    const longLivedData = await longLivedResponse.json()

    const meResponse = await fetch(
      `https://graph.facebook.com/v18.0/me?fields=id,name&access_token=${longLivedData.access_token}`
    )
    const meData = await meResponse.json()

    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${longLivedData.access_token}`
    )
    const pagesData = await pagesResponse.json()

    setTokens((current) => ({
      ...current,
      facebook: {
        accessToken: longLivedData.access_token,
        userId: meData.id,
        expiresAt: Date.now() + (longLivedData.expires_in * 1000),
        username: meData.name,
        pageId: pagesData.data?.[0]?.id,
        pageName: pagesData.data?.[0]?.name
      }
    }))

    toast.success('Facebook connected successfully!')
  }

  const connectInstagram = () => {
    if (!appCredentials?.instagram) {
      toast.error('Configure Instagram app credentials first')
      return
    }

    const authUrl = new URL('https://api.instagram.com/oauth/authorize')
    authUrl.searchParams.append('client_id', appCredentials.instagram.appId)
    authUrl.searchParams.append('redirect_uri', appCredentials.instagram.redirectUri)
    authUrl.searchParams.append('scope', 'user_profile,user_media')
    authUrl.searchParams.append('response_type', 'code')
    authUrl.searchParams.append('state', 'instagram')

    window.location.href = authUrl.toString()
  }

  const connectTikTok = () => {
    if (!appCredentials?.tiktok) {
      toast.error('Configure TikTok app credentials first')
      return
    }

    const authUrl = new URL('https://www.tiktok.com/v2/auth/authorize/')
    authUrl.searchParams.append('client_key', appCredentials.tiktok.clientKey)
    authUrl.searchParams.append('redirect_uri', appCredentials.tiktok.redirectUri)
    authUrl.searchParams.append('response_type', 'code')
    authUrl.searchParams.append('scope', 'video.upload,video.publish')
    authUrl.searchParams.append('state', 'tiktok')

    window.location.href = authUrl.toString()
  }

  const connectYouTube = () => {
    if (!appCredentials?.youtube) {
      toast.error('Configure YouTube app credentials first')
      return
    }

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    authUrl.searchParams.append('client_id', appCredentials.youtube.clientId)
    authUrl.searchParams.append('redirect_uri', appCredentials.youtube.redirectUri)
    authUrl.searchParams.append('response_type', 'code')
    authUrl.searchParams.append('scope', 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube')
    authUrl.searchParams.append('access_type', 'offline')
    authUrl.searchParams.append('state', 'youtube')

    window.location.href = authUrl.toString()
  }

  const connectFacebook = () => {
    if (!appCredentials?.facebook) {
      toast.error('Configure Facebook app credentials first')
      return
    }

    const authUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth')
    authUrl.searchParams.append('client_id', appCredentials.facebook.appId)
    authUrl.searchParams.append('redirect_uri', appCredentials.facebook.redirectUri)
    authUrl.searchParams.append('scope', 'pages_show_list,pages_read_engagement,pages_manage_posts,pages_manage_engagement')
    authUrl.searchParams.append('response_type', 'code')
    authUrl.searchParams.append('state', 'facebook')

    window.location.href = authUrl.toString()
  }

  const disconnectPlatform = (platform: keyof SocialMediaTokens) => {
    setTokens((current) => {
      const updated = { ...current }
      delete updated[platform]
      return updated
    })
    toast.success(`${platform.charAt(0).toUpperCase() + platform.slice(1)} disconnected`)
  }

  const isTokenExpired = (expiresAt?: number) => {
    if (!expiresAt) return true
    return Date.now() >= expiresAt
  }

  const updateAppCredential = (
    platform: keyof SocialMediaAppCredentials,
    field: string,
    value: string
  ) => {
    setAppCredentials((current) => ({
      ...current,
      [platform]: {
        ...(current?.[platform] || {}),
        [field]: value
      }
    }))
  }

  const toggleSecretVisibility = (key: keyof typeof showSecrets) => {
    setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const loadDemoCredentials = () => {
    const demoCreds: SocialMediaAppCredentials = {
      instagram: {
        appId: '1234567890123456',
        appSecret: 'demo_instagram_secret_abc123',
        redirectUri: window.location.origin
      },
      tiktok: {
        clientKey: 'aw1234567890abcdef',
        clientSecret: 'demo_tiktok_secret_xyz789',
        redirectUri: window.location.origin
      },
      youtube: {
        clientId: '123456789012-abc123def456.apps.googleusercontent.com',
        clientSecret: 'demo_youtube_secret_ghi789',
        redirectUri: window.location.origin
      },
      facebook: {
        appId: '1234567890123456',
        appSecret: 'demo_facebook_secret_jkl012',
        redirectUri: window.location.origin
      }
    }

    setAppCredentials(() => demoCreds)
    setShowSecrets({
      instagramSecret: true,
      tiktokSecret: true,
      youtubeSecret: true,
      twitterSecret: true,
      facebookSecret: true
    })
    toast.success('Demo credentials loaded! Note: These won\'t actually authenticate.')
  }

  const simulateConnection = (platform: string) => {
    const mockTokens: SocialMediaTokens = {
      instagram: {
        accessToken: 'demo_ig_token_' + Date.now(),
        userId: 'demo_user_123',
        expiresAt: Date.now() + (60 * 24 * 60 * 60 * 1000),
        username: 'piko_artist'
      },
      tiktok: {
        accessToken: 'demo_tt_token_' + Date.now(),
        refreshToken: 'demo_tt_refresh_' + Date.now(),
        openId: 'demo_open_id_456',
        expiresAt: Date.now() + (60 * 24 * 60 * 60 * 1000),
        username: 'piko_official'
      },
      youtube: {
        accessToken: 'demo_yt_token_' + Date.now(),
        refreshToken: 'demo_yt_refresh_' + Date.now(),
        channelId: 'UCdemo_channel_789',
        expiresAt: Date.now() + (60 * 24 * 60 * 60 * 1000),
        channelName: 'PIKO Official'
      },
      facebook: {
        accessToken: 'demo_fb_token_' + Date.now(),
        userId: 'demo_fb_user_123',
        expiresAt: Date.now() + (60 * 24 * 60 * 60 * 1000),
        username: 'PIKO Artist',
        pageId: 'demo_page_456',
        pageName: 'PIKO Official Page'
      }
    }

    setTokens((current) => ({
      ...current,
      [platform]: mockTokens[platform as keyof SocialMediaTokens]
    }))

    toast.success(`${platform.charAt(0).toUpperCase() + platform.slice(1)} connected (demo mode)!`)
  }

  return (
    <div className="space-y-6">
      <Alert className="border-primary bg-primary/10">
        <Info className="w-5 h-5 text-primary" />
        <AlertDescription className="text-primary font-bold">
          Connect your social media accounts to enable real multi-platform posting
        </AlertDescription>
      </Alert>

      <div className="flex gap-3">
        <Button
          onClick={loadDemoCredentials}
          variant="outline"
          className="flex-1 border-secondary/50 hover:bg-secondary/10 hover:border-secondary transition-all"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Load Demo App Credentials
        </Button>
      </div>

      <Collapsible open={showSetupGuide} onOpenChange={setShowSetupGuide}>
        <Card className="studio-card border-accent/30">
          <CardHeader className="pb-3">
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-accent" />
                  <CardTitle className="text-lg uppercase tracking-tight">Platform Setup Guide</CardTitle>
                </div>
                <ChevronDown className={`w-5 h-5 text-accent transition-transform ${showSetupGuide ? 'rotate-180' : ''}`} />
              </div>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-black uppercase text-primary flex items-center gap-2">
                  <Instagram className="w-4 h-4" />
                  Instagram (Meta for Developers)
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-2">
                  <li>Go to <a href="https://developers.facebook.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">developers.facebook.com</a></li>
                  <li>Create a new app → Choose "Business" type</li>
                  <li>Add "Instagram Basic Display" product</li>
                  <li>Configure OAuth Redirect URIs with your app URL</li>
                  <li>Copy App ID and App Secret</li>
                  <li>Add test users in App Roles → Roles</li>
                </ol>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-black uppercase text-secondary flex items-center gap-2">
                  <Music className="w-4 h-4" />
                  TikTok (TikTok for Developers)
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-2">
                  <li>Go to <a href="https://developers.tiktok.com/" target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline">developers.tiktok.com</a></li>
                  <li>Create a new app in the Developer Portal</li>
                  <li>Request access to "Content Posting API"</li>
                  <li>Configure Redirect URI under Login Kit</li>
                  <li>Copy Client Key and Client Secret</li>
                  <li>Enable "video.upload" and "video.publish" scopes</li>
                </ol>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-black uppercase text-accent flex items-center gap-2">
                  <Youtube className="w-4 h-4" />
                  YouTube (Google Cloud Console)
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-2">
                  <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">console.cloud.google.com</a></li>
                  <li>Create a new project or select existing</li>
                  <li>Enable "YouTube Data API v3"</li>
                  <li>Go to Credentials → Create OAuth 2.0 Client ID</li>
                  <li>Add Authorized redirect URIs</li>
                  <li>Copy Client ID and Client Secret</li>
                </ol>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-black uppercase flex items-center gap-2" style={{ color: 'oklch(0.65 0.25 250)' }}>
                  <Facebook className="w-4 h-4" />
                  Facebook (Meta for Developers)
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-2">
                  <li>Go to <a href="https://developers.facebook.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'oklch(0.65 0.25 250)' }} className="hover:underline">developers.facebook.com</a></li>
                  <li>Create a new app → Choose "Business" or "Consumer" type</li>
                  <li>Add "Facebook Login" product</li>
                  <li>Configure Valid OAuth Redirect URIs</li>
                  <li>Request "pages_manage_posts" permission</li>
                  <li>Copy App ID and App Secret</li>
                </ol>
              </div>

              <div className="p-3 rounded bg-muted/30 border border-border">
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">🔒 Security:</strong> All tokens are stored locally in your browser and never sent to external servers except the platforms themselves during authentication.
                </p>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="studio-card">
          <CardHeader>
            <CardTitle className="text-xl uppercase tracking-tight flex items-center gap-2">
              <Instagram className="w-5 h-5 text-primary" />
              INSTAGRAM
            </CardTitle>
            <CardDescription>Instagram Basic Display API for posting to feed and stories</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-black uppercase">App ID</Label>
              <Input
                value={appCredentials?.instagram?.appId || ''}
                onChange={(e) => updateAppCredential('instagram', 'appId', e.target.value)}
                placeholder="1234567890123456"
                className="bg-muted/50 font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-black uppercase flex items-center justify-between">
                App Secret
                <button
                  onClick={() => toggleSecretVisibility('instagramSecret')}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showSecrets.instagramSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </Label>
              <Input
                type={showSecrets.instagramSecret ? 'text' : 'password'}
                value={appCredentials?.instagram?.appSecret || ''}
                onChange={(e) => updateAppCredential('instagram', 'appSecret', e.target.value)}
                placeholder="Enter App Secret"
                className="bg-muted/50 font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-black uppercase">Redirect URI</Label>
              <Input
                value={appCredentials?.instagram?.redirectUri || window.location.origin}
                onChange={(e) => updateAppCredential('instagram', 'redirectUri', e.target.value)}
                placeholder={window.location.origin}
                className="bg-muted/50 font-mono text-sm"
              />
            </div>

            <Separator />

            {tokens?.instagram && !isTokenExpired(tokens.instagram.expiresAt) ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 rounded bg-secondary/10 border border-secondary">
                  <CheckCircle className="w-5 h-5 text-secondary" />
                  <div className="flex-1">
                    <p className="text-sm font-bold">Connected</p>
                    {tokens.instagram.username && (
                      <p className="text-xs text-muted-foreground">@{tokens.instagram.username}</p>
                    )}
                  </div>
                </div>
                <Button
                  onClick={() => disconnectPlatform('instagram')}
                  variant="outline"
                  className="w-full border-destructive/50 hover:bg-destructive/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Disconnect
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Button
                  onClick={connectInstagram}
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={!appCredentials?.instagram?.appId || !appCredentials?.instagram?.appSecret}
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Connect Instagram
                </Button>
                {appCredentials?.instagram?.appId && (
                  <Button
                    onClick={() => simulateConnection('instagram')}
                    variant="outline"
                    className="w-full border-primary/50 hover:bg-primary/10"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Demo Connect
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="studio-card">
          <CardHeader>
            <CardTitle className="text-xl uppercase tracking-tight flex items-center gap-2">
              <Music className="w-5 h-5 text-secondary" />
              TIKTOK
            </CardTitle>
            <CardDescription>TikTok Content Posting API for video uploads</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-black uppercase">Client Key</Label>
              <Input
                value={appCredentials?.tiktok?.clientKey || ''}
                onChange={(e) => updateAppCredential('tiktok', 'clientKey', e.target.value)}
                placeholder="aw1234567890abcdef"
                className="bg-muted/50 font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-black uppercase flex items-center justify-between">
                Client Secret
                <button
                  onClick={() => toggleSecretVisibility('tiktokSecret')}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showSecrets.tiktokSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </Label>
              <Input
                type={showSecrets.tiktokSecret ? 'text' : 'password'}
                value={appCredentials?.tiktok?.clientSecret || ''}
                onChange={(e) => updateAppCredential('tiktok', 'clientSecret', e.target.value)}
                placeholder="Enter Client Secret"
                className="bg-muted/50 font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-black uppercase">Redirect URI</Label>
              <Input
                value={appCredentials?.tiktok?.redirectUri || window.location.origin}
                onChange={(e) => updateAppCredential('tiktok', 'redirectUri', e.target.value)}
                placeholder={window.location.origin}
                className="bg-muted/50 font-mono text-sm"
              />
            </div>

            <Separator />

            {tokens?.tiktok && !isTokenExpired(tokens.tiktok.expiresAt) ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 rounded bg-secondary/10 border border-secondary">
                  <CheckCircle className="w-5 h-5 text-secondary" />
                  <div className="flex-1">
                    <p className="text-sm font-bold">Connected</p>
                    {tokens.tiktok.username && (
                      <p className="text-xs text-muted-foreground">@{tokens.tiktok.username}</p>
                    )}
                  </div>
                </div>
                <Button
                  onClick={() => disconnectPlatform('tiktok')}
                  variant="outline"
                  className="w-full border-destructive/50 hover:bg-destructive/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Disconnect
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Button
                  onClick={connectTikTok}
                  className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                  disabled={!appCredentials?.tiktok?.clientKey || !appCredentials?.tiktok?.clientSecret}
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Connect TikTok
                </Button>
                {appCredentials?.tiktok?.clientKey && (
                  <Button
                    onClick={() => simulateConnection('tiktok')}
                    variant="outline"
                    className="w-full border-secondary/50 hover:bg-secondary/10"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Demo Connect
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="studio-card">
          <CardHeader>
            <CardTitle className="text-xl uppercase tracking-tight flex items-center gap-2">
              <Youtube className="w-5 h-5 text-accent" />
              YOUTUBE
            </CardTitle>
            <CardDescription>YouTube Data API v3 for Shorts uploads</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-black uppercase">Client ID</Label>
              <Input
                value={appCredentials?.youtube?.clientId || ''}
                onChange={(e) => updateAppCredential('youtube', 'clientId', e.target.value)}
                placeholder="123456-abc.apps.googleusercontent.com"
                className="bg-muted/50 font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-black uppercase flex items-center justify-between">
                Client Secret
                <button
                  onClick={() => toggleSecretVisibility('youtubeSecret')}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showSecrets.youtubeSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </Label>
              <Input
                type={showSecrets.youtubeSecret ? 'text' : 'password'}
                value={appCredentials?.youtube?.clientSecret || ''}
                onChange={(e) => updateAppCredential('youtube', 'clientSecret', e.target.value)}
                placeholder="Enter Client Secret"
                className="bg-muted/50 font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-black uppercase">Redirect URI</Label>
              <Input
                value={appCredentials?.youtube?.redirectUri || window.location.origin}
                onChange={(e) => updateAppCredential('youtube', 'redirectUri', e.target.value)}
                placeholder={window.location.origin}
                className="bg-muted/50 font-mono text-sm"
              />
            </div>

            <Separator />

            {tokens?.youtube && !isTokenExpired(tokens.youtube.expiresAt) ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 rounded bg-secondary/10 border border-secondary">
                  <CheckCircle className="w-5 h-5 text-secondary" />
                  <div className="flex-1">
                    <p className="text-sm font-bold">Connected</p>
                    {tokens.youtube.channelName && (
                      <p className="text-xs text-muted-foreground">{tokens.youtube.channelName}</p>
                    )}
                  </div>
                </div>
                <Button
                  onClick={() => disconnectPlatform('youtube')}
                  variant="outline"
                  className="w-full border-destructive/50 hover:bg-destructive/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Disconnect
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Button
                  onClick={connectYouTube}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                  disabled={!appCredentials?.youtube?.clientId || !appCredentials?.youtube?.clientSecret}
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Connect YouTube
                </Button>
                {appCredentials?.youtube?.clientId && (
                  <Button
                    onClick={() => simulateConnection('youtube')}
                    variant="outline"
                    className="w-full border-accent/50 hover:bg-accent/10"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Demo Connect
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="studio-card">
          <CardHeader>
            <CardTitle className="text-xl uppercase tracking-tight flex items-center gap-2">
              <Facebook className="w-5 h-5" style={{ color: 'oklch(0.65 0.25 250)' }} />
              FACEBOOK
            </CardTitle>
            <CardDescription>Facebook Graph API for page posts and videos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-black uppercase">App ID</Label>
              <Input
                value={appCredentials?.facebook?.appId || ''}
                onChange={(e) => updateAppCredential('facebook', 'appId', e.target.value)}
                placeholder="1234567890123456"
                className="bg-muted/50 font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-black uppercase flex items-center justify-between">
                App Secret
                <button
                  onClick={() => toggleSecretVisibility('facebookSecret')}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showSecrets.facebookSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </Label>
              <Input
                type={showSecrets.facebookSecret ? 'text' : 'password'}
                value={appCredentials?.facebook?.appSecret || ''}
                onChange={(e) => updateAppCredential('facebook', 'appSecret', e.target.value)}
                placeholder="Enter App Secret"
                className="bg-muted/50 font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-black uppercase">Redirect URI</Label>
              <Input
                value={appCredentials?.facebook?.redirectUri || window.location.origin}
                onChange={(e) => updateAppCredential('facebook', 'redirectUri', e.target.value)}
                placeholder={window.location.origin}
                className="bg-muted/50 font-mono text-sm"
              />
            </div>

            <Separator />

            {tokens?.facebook && !isTokenExpired(tokens.facebook.expiresAt) ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 rounded bg-secondary/10 border border-secondary">
                  <CheckCircle className="w-5 h-5 text-secondary" />
                  <div className="flex-1">
                    <p className="text-sm font-bold">Connected</p>
                    {tokens.facebook.pageName && (
                      <p className="text-xs text-muted-foreground">{tokens.facebook.pageName}</p>
                    )}
                  </div>
                </div>
                <Button
                  onClick={() => disconnectPlatform('facebook')}
                  variant="outline"
                  className="w-full border-destructive/50 hover:bg-destructive/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Disconnect
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Button
                  onClick={connectFacebook}
                  className="w-full"
                  style={{ backgroundColor: 'oklch(0.65 0.25 250)', color: 'white' }}
                  disabled={!appCredentials?.facebook?.appId || !appCredentials?.facebook?.appSecret}
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Connect Facebook
                </Button>
                {appCredentials?.facebook?.appId && (
                  <Button
                    onClick={() => simulateConnection('facebook')}
                    variant="outline"
                    className="w-full"
                    style={{ borderColor: 'oklch(0.65 0.25 250 / 0.5)' }}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Demo Connect
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="studio-card border-primary/30">
        <CardHeader>
          <CardTitle className="text-xl uppercase tracking-tight flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            CONNECTION STATUS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center justify-between p-3 rounded bg-muted/30 border border-border">
              <div className="flex items-center gap-2">
                <Instagram className="w-5 h-5 text-primary" />
                <span className="text-sm font-bold">Instagram</span>
              </div>
              {tokens?.instagram && !isTokenExpired(tokens.instagram.expiresAt) ? (
                <Badge className="bg-secondary/20 text-secondary border-secondary/50">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              ) : (
                <Badge variant="outline" className="border-muted-foreground/50">
                  Not Connected
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between p-3 rounded bg-muted/30 border border-border">
              <div className="flex items-center gap-2">
                <Music className="w-5 h-5 text-secondary" />
                <span className="text-sm font-bold">TikTok</span>
              </div>
              {tokens?.tiktok && !isTokenExpired(tokens.tiktok.expiresAt) ? (
                <Badge className="bg-secondary/20 text-secondary border-secondary/50">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              ) : (
                <Badge variant="outline" className="border-muted-foreground/50">
                  Not Connected
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between p-3 rounded bg-muted/30 border border-border">
              <div className="flex items-center gap-2">
                <Youtube className="w-5 h-5 text-accent" />
                <span className="text-sm font-bold">YouTube</span>
              </div>
              {tokens?.youtube && !isTokenExpired(tokens.youtube.expiresAt) ? (
                <Badge className="bg-secondary/20 text-secondary border-secondary/50">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              ) : (
                <Badge variant="outline" className="border-muted-foreground/50">
                  Not Connected
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between p-3 rounded bg-muted/30 border border-border">
              <div className="flex items-center gap-2">
                <Facebook className="w-5 h-5" style={{ color: 'oklch(0.65 0.25 250)' }} />
                <span className="text-sm font-bold">Facebook</span>
              </div>
              {tokens?.facebook && !isTokenExpired(tokens.facebook.expiresAt) ? (
                <Badge className="bg-secondary/20 text-secondary border-secondary/50">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              ) : (
                <Badge variant="outline" className="border-muted-foreground/50">
                  Not Connected
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
