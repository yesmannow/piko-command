export interface OAuthCredentials {
  accessToken: string
  refreshToken?: string
  scope?: string
  username?: string
  userId?: string
}

export interface OAuthResult {
  credentials?: OAuthCredentials
  error?: string
}

export interface PlatformConnection {
  credentials?: OAuthCredentials
  error?: string
  expiresAt?: number
  connected?: boolean
  lastConnected?: number
}

export interface AuthConfig {
  twitter?: {
    clientId?: string
    clientSecret?: string
  }
  instagram?: {
    clientId?: string
    clientSecret?: string
  }
  tiktok?: {
    clientKey?: string
    clientId?: string
    clientSecret?: string
  }
  facebook?: {
    clientId?: string
    clientSecret?: string
  }
  linkedin?: {
    clientId?: string
    clientSecret?: string
  }
}

export class AuthService {
  static async initiateOAuth(platform: string, config?: AuthConfig): Promise<void> {
    throw new Error(`OAuth for ${platform} not implemented with config: ${JSON.stringify(config)}`)
  }

  static async handleCallback(platform: string, code: string, state: string): Promise<OAuthResult> {
    throw new Error(`OAuth callback not implemented for ${platform}: ${code}, ${state}`)
  }

  static updateConfig(config: AuthConfig): void {
    console.log('Config update not implemented', config)
  }

  static getConfig(): AuthConfig {
    return {}
  }
}
