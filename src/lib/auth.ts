export interface OAuthCredentials {
  accessToken: string
  expiresAt: number
  username?: string
}
export interface Pl
  connected: boo
 

export interface PlatformConnection {
  platform: 'twitter' | 'instagram' | 'tiktok' | 'facebook' | 'linkedin'
  connected: boolean
  credentials?: OAuthCredentials
  lastConnected?: number
  error?: string
}

export interface AuthConfig {
  tiktok?: {
    clientSecret: st
  facebook?: {
   
  linkedin?: {
    clientSecret: st
}
con
    authoriz
    scopes: ['tweet.
  instagram: {
   
  },
    authorize: 'http
    scopes: ['user.info.
  f
    token: 'ht
  },
    authorize: 'https://
   
}

  private static STATE_KE

    return Math.random().toString(36).substring(2, 15) +
  }
  static async initiateOAuth(
    
    const plat
      throw new Error(`${platform} Client ID not configured

    const state = this.generateState()
    

      client_id: platformConfig.clientId,
      response_type: 'code',
      state: state

      params.
    }
    const authUrl = `${endpoint.authorize}?${params.toString()}`
    const width = 600
    

      authUrl,
      `width=${width},height=${height},left=${left},top=${t
  }
  s
 

    const platform = sessio
    if (!savedState || savedState !== state) {
    }
    if (!platform) {

    sessionStorage.removeItem(this

    if (!platformConfig) {
   

      grant_type: 'authorizat
      redirect_uri: this.REDIRECT_URI,
      client_secret: p

      method: 'POST',
        'Content-Type': 'application
      body: tokenParams.toString()


    }
    const data = await response.json()
    
      refreshToken: data.refresh_token,
      scope: data.scope

  static async refreshToken(
    refreshToken: string,
  ): Promise<OAuthCredentials> {
    if (!platformConfig) {
    }
    const endpoint
      

    })
    const response = await fetch(endpoint.token
      headers: {
     

    if (!response.ok) {
    
    const data = awai
    return {
      refreshToken: data.refresh_token || refreshToken,
    }

    return Date.

    platform: keyof t
    config: AuthConfig
    i
   

    }
    return await 
}
















































































































