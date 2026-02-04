export interface OAuthCredentials {
  accessToken: string
  expiresAt: number
  refreshToken?: string
  username?: string
  scope?: string
  userId?: string
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

interface OAuthEndpoint {
  authorize: string
  token: string
  scopes: string[]
}

type Platform = 'twitter' | 'instagram' | 'tiktok' | 'facebook' | 'linkedin'

const OAUTH_ENDPOINTS: Record<Platform, OAuthEndpoint> = {
  twitter: {
    authorize: 'https://twitter.com/i/oauth2/authorize',
    token: 'https://api.twitter.com/2/oauth2/token',
    scopes: ['tweet.read', 'tweet.write', 'users.read']
  },
  instagram: {
    authorize: 'https://api.instagram.com/oauth/authorize',
    token: 'https://api.instagram.com/oauth/access_token',
    scopes: ['user_profile', 'user_media']
  },
  tiktok: {
    authorize: 'https://www.tiktok.com/auth/authorize',
    token: 'https://open-api.tiktok.com/oauth/access_token',
    scopes: ['user.info.basic', 'video.list']
  },
  facebook: {
    authorize: 'https://www.facebook.com/v18.0/dialog/oauth',
    token: 'https://graph.facebook.com/v18.0/oauth/access_token',
    scopes: ['pages_manage_posts', 'pages_read_engagement']
  },
  linkedin: {
    authorize: 'https://www.linkedin.com/oauth/v2/authorization',
    token: 'https://www.linkedin.com/oauth/v2/accessToken',
    scopes: ['w_member_social', 'r_liteprofile']
  }
}

export class AuthService {
  private static STATE_KEY = 'piko_auth_state'
  private static PLATFORM_KEY = 'piko_auth_platform'
  private static REDIRECT_URI = typeof window !== 'undefined' 
    ? `${window.location.origin}/oauth/callback` 
    : ''

  private static config: AuthConfig = {
    twitter: {
      clientId: import.meta.env.VITE_TWITTER_CLIENT_ID || '',
      clientSecret: import.meta.env.VITE_TWITTER_CLIENT_SECRET || ''
    },
    instagram: {
      clientId: import.meta.env.VITE_INSTAGRAM_CLIENT_ID || '',
      clientSecret: import.meta.env.VITE_INSTAGRAM_CLIENT_SECRET || ''
    },
    tiktok: {
      clientId: import.meta.env.VITE_TIKTOK_CLIENT_ID || '',
      clientSecret: import.meta.env.VITE_TIKTOK_CLIENT_SECRET || ''
    },
    facebook: {
      clientId: import.meta.env.VITE_FACEBOOK_CLIENT_ID || '',
      clientSecret: import.meta.env.VITE_FACEBOOK_CLIENT_SECRET || ''
    },
    linkedin: {
      clientId: import.meta.env.VITE_LINKEDIN_CLIENT_ID || '',
      clientSecret: import.meta.env.VITE_LINKEDIN_CLIENT_SECRET || ''
    }
  }

  private static generateState(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15)
  }

  static initiateOAuth(platform: Platform): { state: string; url: string } {
    const platformConfig = this.config[platform]
    const endpoint = OAUTH_ENDPOINTS[platform]

    if (!platformConfig || !platformConfig.clientId) {
      throw new Error(`${platform} OAuth is not configured. Please add credentials in settings.`)
    }

    const state = this.generateState()
    
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(this.STATE_KEY, state)
      sessionStorage.setItem(this.PLATFORM_KEY, platform)
    }

    const params = new URLSearchParams({
      client_id: platformConfig.clientId,
      redirect_uri: this.REDIRECT_URI,
      response_type: 'code',
      state: state,
      scope: endpoint.scopes.join(' ')
    })

    const authUrl = `${endpoint.authorize}?${params.toString()}`

    const width = 600
    const height = 700
    const left = (window.screen.width - width) / 2
    const top = (window.screen.height - height) / 2

    if (typeof window !== 'undefined') {
      window.open(
        authUrl,
        `${platform}_oauth`,
        `width=${width},height=${height},left=${left},top=${top}`
      )
    }

    return { state, url: authUrl }
  }

  static async handleCallback(
    platform: Platform,
    code: string,
    state: string
  ): Promise<OAuthCredentials> {
    if (typeof window === 'undefined') {
      throw new Error('handleCallback must be called in browser context')
    }

    const savedState = sessionStorage.getItem(this.STATE_KEY)
    const savedPlatform = sessionStorage.getItem(this.PLATFORM_KEY)

    if (!savedState || savedState !== state) {
      throw new Error('Invalid OAuth state - possible CSRF attack')
    }

    if (savedPlatform !== platform) {
      throw new Error('Platform mismatch in OAuth flow')
    }

    sessionStorage.removeItem(this.STATE_KEY)
    sessionStorage.removeItem(this.PLATFORM_KEY)

    const platformConfig = this.config[platform]
    const endpoint = OAUTH_ENDPOINTS[platform]

    if (!platformConfig || !platformConfig.clientId || !platformConfig.clientSecret) {
      throw new Error(`${platform} OAuth credentials not configured`)
    }

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
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: tokenParams.toString()
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Token exchange failed: ${errorText}`)
    }

    const data = await response.json()

    return {
      accessToken: data.access_token,
      expiresAt: this.calculateExpiresAt(data.expires_in),
      refreshToken: data.refresh_token,
      username: data.username || data.screen_name,
      scope: data.scope
    }
  }

  static async refreshToken(
    platform: Platform,
    refreshToken: string
  ): Promise<OAuthCredentials> {
    const platformConfig = this.config[platform]
    const endpoint = OAUTH_ENDPOINTS[platform]

    if (!platformConfig || !platformConfig.clientId || !platformConfig.clientSecret) {
      throw new Error(`${platform} OAuth credentials not configured`)
    }

    const tokenParams = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: platformConfig.clientId,
      client_secret: platformConfig.clientSecret
    })

    const response = await fetch(endpoint.token, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: tokenParams.toString()
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Token refresh failed: ${errorText}`)
    }

    const data = await response.json()

    return {
      accessToken: data.access_token,
      expiresAt: this.calculateExpiresAt(data.expires_in),
      refreshToken: data.refresh_token || refreshToken,
      scope: data.scope
    }
  }

  private static calculateExpiresAt(expiresIn: number): number {
    return Date.now() + (expiresIn * 1000)
  }

  static isTokenExpired(credentials: OAuthCredentials): boolean {
    return Date.now() >= credentials.expiresAt
  }

  static async getValidToken(
    platform: Platform,
    credentials: OAuthCredentials
  ): Promise<OAuthCredentials> {
    if (!this.isTokenExpired(credentials)) {
      return credentials
    }

    if (credentials.refreshToken) {
      return await this.refreshToken(platform, credentials.refreshToken)
    }

    throw new Error('Token expired and no refresh token available')
  }

  static updateConfig(config: Partial<AuthConfig>): void {
    this.config = { ...this.config, ...config }
  }

  static getConfig(): AuthConfig {
    return { ...this.config }
  }

  static isPlatformConfigured(platform: Platform): boolean {
    const platformConfig = this.config[platform]
    return !!(platformConfig && platformConfig.clientId && platformConfig.clientSecret)
  }
}
