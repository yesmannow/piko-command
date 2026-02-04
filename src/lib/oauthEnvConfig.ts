export const OAuthEnvConfig = {
  twitter: {
    clientId: import.meta.env.VITE_TWITTER_CLIENT_ID || '',
    clientSecret: import.meta.env.VITE_TWITTER_CLIENT_SECRET || ''
  },
  instagram: {
    clientId: import.meta.env.VITE_INSTAGRAM_CLIENT_ID || '',
    clientSecret: import.meta.env.VITE_INSTAGRAM_CLIENT_SECRET || ''
  },
  tiktok: {
    clientId: import.meta.env.VITE_TIKTOK_CLIENT_KEY || '',
    clientSecret: import.meta.env.VITE_TIKTOK_CLIENT_SECRET || ''
  },
  facebook: {
    clientId: import.meta.env.VITE_FACEBOOK_APP_ID || '',
    clientSecret: import.meta.env.VITE_FACEBOOK_APP_SECRET || ''
  },
  linkedin: {
    clientId: import.meta.env.VITE_LINKEDIN_CLIENT_ID || '',
    clientSecret: import.meta.env.VITE_LINKEDIN_CLIENT_SECRET || ''
  }
}

export function hasEnvConfig(platform: keyof typeof OAuthEnvConfig): boolean {
  const config = OAuthEnvConfig[platform]
  return !!(config.clientId && config.clientSecret)
}

export function getEnvConfigSummary() {
  return Object.entries(OAuthEnvConfig).map(([platform, config]) => ({
    platform,
    configured: !!(config.clientId && config.clientSecret),
    hasClientId: !!config.clientId,
    hasClientSecret: !!config.clientSecret
  }))
}
