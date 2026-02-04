console.warn('oauthEnvConfig.ts is deprecated - OAuth features not implemented')

export const OAuthEnvConfig = {
  twitter: { clientId: '', clientSecret: '' },
  instagram: { clientId: '', clientSecret: '' },
  tiktok: { clientId: '', clientSecret: '' },
  facebook: { clientId: '', clientSecret: '' },
  linkedin: { clientId: '', clientSecret: '' }
}

export function hasEnvConfig(): boolean {
  return false
}

export function getEnvConfigSummary() {
  return []
}
