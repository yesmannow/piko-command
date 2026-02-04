export interface OAuthCredentials {
  accessToken: string
  refreshToken?: string
  expiresAt: number
  userId?: string
  username?: string
  scope?: string
}

export interface PlatformConnection {
  platform: 'twitter' | 'instagram' | 'tiktok' | 'facebook' | 'linkedin'
  connected: boolean
  credentials?: OAuthCredentials
  lastConnected?: number
  error?: string
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

const OAUTH_ENDPOINTS = {
  twitter: {
    authorize: 'https://twitter.com/i/oauth2/authorize',
    token: 'https://api.twitter.com/2/oauth2/token',
    scopes: ['tweet.read', 'tweet.write', 'users.read', 'offline.access']
  },
  instagram: {
    authorize: 'https://api.instagram.com/oauth/authorize',
    token: 'https://api.instagram.com/oauth/access_token',
    scopes: ['user_profile', 'user_media']
  },
  tiktok: {
    authorize: 'https://www.tiktok.com/v2/auth/authorize',
    token: 'https://open.tiktokapis.com/v2/oauth/token/',
    scopes: ['user.info.basic', 'video.publish', 'video.upload']
  },
  facebook: {
    authorize: 'https://www.facebook.com/v18.0/dialog/oauth',
    token: 'https://graph.facebook.com/v18.0/oauth/access_token',
    scopes: ['pages_manage_posts', 'pages_read_engagement', 'public_profile']
  },
  linkedin: {
    authorize: 'https://www.linkedin.com/oauth/v2/authorization',
    token: 'https://www.linkedin.com/oauth/v2/accessToken',
    scopes: ['w_member_social', 'r_liteprofile']
  }
}

export class OAuthManager {
  private static REDIRECT_URI = `${window.location.origin}/oauth/callback`
  private static STATE_KEY = 'oauth_state'
  private static PLATFORM_KEY = 'oauth_platform'

  static generateState(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15)
  }

  static async initiateOAuth(
    platform: keyof typeof OAUTH_ENDPOINTS,
    config: AuthConfig
  ): Promise<void> {
    const platformConfig = config[platform]
    if (!platformConfig?.clientId) {
      throw new Error(`${platform} Client ID not configured`)
    }

    const endpoint = OAUTH_ENDPOINTS[platform]
    const state = this.generateState()
    
    sessionStorage.setItem(this.STATE_KEY, state)
    sessionStorage.setItem(this.PLATFORM_KEY, platform)

    const params = new URLSearchParams({
      client_id: platformConfig.clientId,
      redirect_uri: this.REDIRECT_URI,
      response_type: 'code',
      scope: endpoint.scopes.join(' '),
      state: state
    })

    if (platform === 'twitter') {
      params.set('code_challenge', 'challenge')
      params.set('code_challenge_method', 'plain')
    }

    const authUrl = `${endpoint.authorize}?${params.toString()}`
    
    const width = 600
    const height = 700
    const left = window.screenX + (window.outerWidth - width) / 2
    const top = window.screenY + (window.outerHeight - height) / 2

    window.open(
      authUrl,
      'oauth_window',
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
    )
  }

  static async handleCallback(
    code: string,
    state: string,
    config: AuthConfig
  ): Promise<OAuthCredentials> {
    const savedState = sessionStorage.getItem(this.STATE_KEY)
    const platform = sessionStorage.getItem(this.PLATFORM_KEY) as keyof typeof OAUTH_ENDPOINTS

    if (!savedState || savedState !== state) {
      throw new Error('Invalid OAuth state - possible CSRF attack')
    }

    if (!platform) {
      throw new Error('OAuth platform not found')
    }

    sessionStorage.removeItem(this.STATE_KEY)
    sessionStorage.removeItem(this.PLATFORM_KEY)

    const platformConfig = config[platform]
    if (!platformConfig) {
      throw new Error(`${platform} configuration not found`)
    }

    const endpoint = OAUTH_ENDPOINTS[platform]
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: this.REDIRECT_URI,
      client_id: platformConfig.clientId,
      client_secret: platformConfig.clientSecret
    })

    const response = await fetch(endpoint.token, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenParams.toString()
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Token exchange failed: ${error}`)
    }

    const data = await response.json()

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + (data.expires_in * 1000),
      scope: data.scope
    }
  }

  static async refreshToken(
    platform: keyof typeof OAUTH_ENDPOINTS,
    refreshToken: string,
    config: AuthConfig
  ): Promise<OAuthCredentials> {
    const platformConfig = config[platform]
    if (!platformConfig) {
      throw new Error(`${platform} configuration not found`)
    }

    const endpoint = OAUTH_ENDPOINTS[platform]
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: platformConfig.clientId,
      client_secret: platformConfig.clientSecret
    })

    const response = await fetch(endpoint.token, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString()
    })

    if (!response.ok) {
      throw new Error('Token refresh failed')
    }

    const data = await response.json()

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken,
      expiresAt: Date.now() + (data.expires_in * 1000)
    }
  }

  static isTokenExpired(credentials: OAuthCredentials): boolean {
    return Date.now() >= credentials.expiresAt
  }

  static async ensureValidToken(
    platform: keyof typeof OAUTH_ENDPOINTS,
    credentials: OAuthCredentials,
    config: AuthConfig
  ): Promise<OAuthCredentials> {
    if (!this.isTokenExpired(credentials)) {
      return credentials
    }

    if (!credentials.refreshToken) {
      throw new Error('Token expired and no refresh token available')
    }

    return await this.refreshToken(platform, credentials.refreshToken, config)
  }
}
