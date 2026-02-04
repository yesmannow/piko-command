export interface OAuthCredentials {
  accessToken: string
  refreshToken?: string
  expiresAt?: number
  scope?: string
  username?: string
  userId?: string
}

export interface PlatformConnection {
  platform: string
  connected: boolean
  credentials?: OAuthCredentials
  error?: string
  lastConnected?: number
}

export interface AuthConfig {
  twitter?: {
    clientId: string
    clientSecret: string
  }
  instagram?: {
    clientId: string
    clientSecret: string
  }
  tiktok?: {
    clientId: string
    clientSecret: string
  }
  facebook?: {
    clientId: string
    clientSecret: string
  }
  linkedin?: {
    clientId: string
    clientSecret: string
  }
}

class OAuthService {
  private config: AuthConfig = {}
  private redirectUri: string

  constructor() {
    this.redirectUri = `${window.location.origin}/oauth/callback`
  }

  updateConfig(config: AuthConfig) {
    this.config = config
  }

  initiateOAuth(platform: keyof AuthConfig) {
    const platformConfig = this.config[platform]
    
    if (!platformConfig?.clientId || !platformConfig?.clientSecret) {
      throw new Error(`${platform} credentials not configured`)
    }

    const state = this.generateState()
    sessionStorage.setItem('oauth_state', state)
    sessionStorage.setItem('oauth_platform', platform)

    let authUrl: URL

    switch (platform) {
      case 'twitter':
        authUrl = new URL('https://twitter.com/i/oauth2/authorize')
        authUrl.searchParams.append('response_type', 'code')
        authUrl.searchParams.append('client_id', platformConfig.clientId)
        authUrl.searchParams.append('redirect_uri', this.redirectUri)
        authUrl.searchParams.append('scope', 'tweet.read tweet.write users.read offline.access')
        authUrl.searchParams.append('state', state)
        authUrl.searchParams.append('code_challenge', 'challenge')
        authUrl.searchParams.append('code_challenge_method', 'plain')
        break

      case 'instagram':
        authUrl = new URL('https://api.instagram.com/oauth/authorize')
        authUrl.searchParams.append('client_id', platformConfig.clientId)
        authUrl.searchParams.append('redirect_uri', this.redirectUri)
        authUrl.searchParams.append('scope', 'user_profile,user_media')
        authUrl.searchParams.append('response_type', 'code')
        authUrl.searchParams.append('state', state)
        break

      case 'tiktok':
        authUrl = new URL('https://www.tiktok.com/v2/auth/authorize/')
        authUrl.searchParams.append('client_key', platformConfig.clientId)
        authUrl.searchParams.append('redirect_uri', this.redirectUri)
        authUrl.searchParams.append('response_type', 'code')
        authUrl.searchParams.append('scope', 'video.upload,video.publish')
        authUrl.searchParams.append('state', state)
        break

      case 'facebook':
        authUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth')
        authUrl.searchParams.append('client_id', platformConfig.clientId)
        authUrl.searchParams.append('redirect_uri', this.redirectUri)
        authUrl.searchParams.append('scope', 'pages_show_list,pages_read_engagement,pages_manage_posts')
        authUrl.searchParams.append('response_type', 'code')
        authUrl.searchParams.append('state', state)
        break

      case 'linkedin':
        authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization')
        authUrl.searchParams.append('response_type', 'code')
        authUrl.searchParams.append('client_id', platformConfig.clientId)
        authUrl.searchParams.append('redirect_uri', this.redirectUri)
        authUrl.searchParams.append('scope', 'w_member_social')
        authUrl.searchParams.append('state', state)
        break

      default:
        throw new Error(`Unsupported platform: ${platform}`)
    }

    const popup = window.open(
      authUrl.toString(),
      `${platform}_oauth`,
      'width=600,height=700,scrollbars=yes'
    )

    if (!popup) {
      throw new Error('Popup blocked. Please allow popups for this site.')
    }
  }

  async handleCallback(platform: string, code: string, state: string): Promise<OAuthCredentials> {
    const savedState = sessionStorage.getItem('oauth_state')
    
    if (state !== savedState) {
      throw new Error('Invalid state parameter - possible CSRF attack')
    }

    sessionStorage.removeItem('oauth_state')
    sessionStorage.removeItem('oauth_platform')

    const platformConfig = this.config[platform as keyof AuthConfig]
    
    if (!platformConfig) {
      throw new Error(`${platform} not configured`)
    }

    switch (platform) {
      case 'twitter':
        return this.handleTwitterCallback(code, platformConfig)
      case 'instagram':
        return this.handleInstagramCallback(code, platformConfig)
      case 'tiktok':
        return this.handleTikTokCallback(code, platformConfig)
      case 'facebook':
        return this.handleFacebookCallback(code, platformConfig)
      case 'linkedin':
        return this.handleLinkedInCallback(code, platformConfig)
      default:
        throw new Error(`Unsupported platform: ${platform}`)
    }
  }

  private async handleTwitterCallback(
    code: string,
    config: { clientId: string; clientSecret: string }
  ): Promise<OAuthCredentials> {
    const tokenUrl = 'https://api.twitter.com/2/oauth2/token'
    const credentials = btoa(`${config.clientId}:${config.clientSecret}`)

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        redirect_uri: this.redirectUri,
        code_verifier: 'challenge'
      })
    })

    if (!response.ok) {
      throw new Error(`Twitter OAuth failed: ${response.statusText}`)
    }

    const data = await response.json()

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + (data.expires_in * 1000),
      scope: data.scope
    }
  }

  private async handleInstagramCallback(
    code: string,
    config: { clientId: string; clientSecret: string }
  ): Promise<OAuthCredentials> {
    const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: this.redirectUri,
        code
      })
    })

    if (!tokenResponse.ok) {
      throw new Error('Instagram token exchange failed')
    }

    const tokenData = await tokenResponse.json()

    const longLivedResponse = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${config.clientSecret}&access_token=${tokenData.access_token}`
    )

    const longLivedData = await longLivedResponse.json()

    return {
      accessToken: longLivedData.access_token,
      userId: tokenData.user_id,
      expiresAt: Date.now() + (longLivedData.expires_in * 1000),
      username: tokenData.username
    }
  }

  private async handleTikTokCallback(
    code: string,
    config: { clientId: string; clientSecret: string }
  ): Promise<OAuthCredentials> {
    const response = await fetch('https://open-api.tiktok.com/oauth/access_token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: config.clientId,
        client_secret: config.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: this.redirectUri
      })
    })

    if (!response.ok) {
      throw new Error('TikTok token exchange failed')
    }

    const data = await response.json()

    if (!data.data) {
      throw new Error(data.error?.message || 'TikTok authentication failed')
    }

    return {
      accessToken: data.data.access_token,
      refreshToken: data.data.refresh_token,
      expiresAt: Date.now() + (data.data.expires_in * 1000)
    }
  }

  private async handleFacebookCallback(
    code: string,
    config: { clientId: string; clientSecret: string }
  ): Promise<OAuthCredentials> {
    const tokenUrl = new URL('https://graph.facebook.com/v18.0/oauth/access_token')
    tokenUrl.searchParams.append('client_id', config.clientId)
    tokenUrl.searchParams.append('client_secret', config.clientSecret)
    tokenUrl.searchParams.append('redirect_uri', this.redirectUri)
    tokenUrl.searchParams.append('code', code)

    const response = await fetch(tokenUrl.toString())

    if (!response.ok) {
      throw new Error('Facebook token exchange failed')
    }

    const data = await response.json()

    return {
      accessToken: data.access_token,
      expiresAt: Date.now() + (data.expires_in * 1000)
    }
  }

  private async handleLinkedInCallback(
    code: string,
    config: { clientId: string; clientSecret: string }
  ): Promise<OAuthCredentials> {
    const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.redirectUri,
        client_id: config.clientId,
        client_secret: config.clientSecret
      })
    })

    if (!response.ok) {
      throw new Error('LinkedIn token exchange failed')
    }

    const data = await response.json()

    return {
      accessToken: data.access_token,
      expiresAt: Date.now() + (data.expires_in * 1000)
    }
  }

  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }
}

export const AuthService = new OAuthService()
