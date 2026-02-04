export interface PlatformConnection {
  platform: string
  connected: boolean
  credentials?: {
    accessToken?: string
    refreshToken?: string
    userId?: string
    username?: string
  }
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

export const AuthService = {
  updateConfig(config: AuthConfig) {
    console.warn('AuthService is deprecated - OAuth features not implemented')
  },
  
  initiateOAuth(platform: keyof AuthConfig) {
    console.warn('AuthService is deprecated - OAuth features not implemented')
    throw new Error('OAuth is not implemented')
  },
  
  async handleCallback(code: string, state: string): Promise<{ platform: string; credentials: any }> {
    console.warn('AuthService is deprecated - OAuth features not implemented')
    throw new Error('OAuth is not implemented')
  }
}
