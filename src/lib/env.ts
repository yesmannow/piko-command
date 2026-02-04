/**
 * Environment variable validation and configuration
 * Validates required environment variables at app startup
 */

interface EnvConfig {
  // GitHub OAuth (optional - not currently used)
  VITE_GITHUB_CLIENT_ID?: string;
  VITE_GITHUB_CLIENT_SECRET?: string;
  
  // Social Media OAuth (optional - not currently used)
  VITE_TWITTER_CLIENT_ID?: string;
  VITE_TWITTER_CLIENT_SECRET?: string;
  VITE_INSTAGRAM_CLIENT_ID?: string;
  VITE_INSTAGRAM_CLIENT_SECRET?: string;
  VITE_TIKTOK_CLIENT_ID?: string;
  VITE_TIKTOK_CLIENT_SECRET?: string;
  VITE_FACEBOOK_CLIENT_ID?: string;
  VITE_FACEBOOK_CLIENT_SECRET?: string;
  VITE_LINKEDIN_CLIENT_ID?: string;
  VITE_LINKEDIN_CLIENT_SECRET?: string;
}

/**
 * Get environment variable with optional fallback
 */
function getEnv(key: keyof EnvConfig, fallback?: string): string | undefined {
  return import.meta.env[key] || fallback;
}

/**
 * Check if OAuth credentials are configured
 * @param platform - Platform to check
 * @returns true if both client ID and secret are configured
 */
export function hasOAuthCredentials(platform: 'twitter' | 'instagram' | 'tiktok' | 'facebook' | 'linkedin'): boolean {
  const clientIdKey = `VITE_${platform.toUpperCase()}_CLIENT_ID` as keyof EnvConfig;
  const clientSecretKey = `VITE_${platform.toUpperCase()}_CLIENT_SECRET` as keyof EnvConfig;
  
  const clientId = getEnv(clientIdKey);
  const clientSecret = getEnv(clientSecretKey);
  
  return !!(clientId && clientSecret);
}

/**
 * Get OAuth credentials for a platform
 * @param platform - Platform to get credentials for
 * @returns Credentials object or null if not configured
 */
export function getOAuthCredentials(platform: 'twitter' | 'instagram' | 'tiktok' | 'facebook' | 'linkedin'): { clientId: string; clientSecret: string } | null {
  const clientIdKey = `VITE_${platform.toUpperCase()}_CLIENT_ID` as keyof EnvConfig;
  const clientSecretKey = `VITE_${platform.toUpperCase()}_CLIENT_SECRET` as keyof EnvConfig;
  
  const clientId = getEnv(clientIdKey);
  const clientSecret = getEnv(clientSecretKey);
  
  if (!clientId || !clientSecret) {
    return null;
  }
  
  return { clientId, clientSecret };
}

/**
 * Validate environment configuration on app startup
 * Logs warnings for missing optional configurations
 */
export function validateEnvConfig(): void {
  const isDevelopment = import.meta.env.DEV;
  
  if (!isDevelopment) {
    // In production, we expect env vars to be set if OAuth is needed
    return;
  }
  
  // Check for OAuth credentials (all optional since we use browser intents)
  const platforms: Array<'twitter' | 'instagram' | 'tiktok' | 'facebook' | 'linkedin'> = [
    'twitter', 'instagram', 'tiktok', 'facebook', 'linkedin'
  ];
  
  const configuredPlatforms = platforms.filter(hasOAuthCredentials);
  
  if (configuredPlatforms.length > 0) {
    console.info(`[ENV] OAuth configured for: ${configuredPlatforms.join(', ')}`);
    console.info('[ENV] Note: OAuth is not currently implemented. App uses browser intents instead.');
  } else {
    console.info('[ENV] No OAuth credentials configured (this is OK - using browser intents)');
  }
}

/**
 * Export environment configuration
 */
export const env = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  mode: import.meta.env.MODE,
} as const;
