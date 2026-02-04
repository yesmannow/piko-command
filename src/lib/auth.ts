export interface OAuthCredentials {
  refreshToken?: stri
  scope?: string
  userId?: string
  scope?: string
  username?: string
  userId?: string
}

  lastConnected?: number

  twitter?: {
    clientSecret: string
  instagram?: {
    clientSecret: string
 

  facebook?: {
    clientSec
  linkedin?: {
    clientSecret: string
}
class OAuthServ
  private redirectUr
  constructor() {
  }
  updateConf
  }
  initiateOAuth(platform
   
      throw ne

    sessionStorage.setIt


      case 'twitter'
        authUrl.searchPa
   
 


        authUrl = new URL('https:
        authUrl.searchParams.

        break
      case 'tiktok':
   

        authUrl.searchParams.append(

   

        authUrl.searchParams.append('response
        break
    
        authUrl.searchParams.append('response_type', 'code')
        authUrl.searchParams.append('redirect_uri', this.redire
     

        throw new Error(`Unsupported p

      authUrl.toString(),



  }
  async handleCallbac
    
      throw new Error('Invalid state parameter - possible CS

    sessionStorage.removeItem('oauth_platform')
    const platformConfig = this.config[platform as keyof AuthConfig]
    if (!platformConfig) {
    }
    switch (platform) {
        retur

        return this.han
        return this.handleFacebookCallback(code, platformConfig)
        return this.handleLinkedInCallback(code, platformConfig)
        throw new Error(`Unsupported platform: ${platform}`)
  }
  private async handleTwitterCallback(
    config: { clientId: string; clientSecret: strin
    const tok

      method: 'POST'
        'Authorization': `Basic ${credentials}`,
      },
        code,
        redirect_uri: this.redirectUri,
      })

      throw n


      accessToken: data.access_token,
      expiresAt: Date.now() + (data.expires_in * 1000),
    }

    code: string,
  ): Promise<OAuthCredentials> {
      method:

        client_secret:
        redirect_uri: this.redirectUri,
      })

      throw new Error('Instagram token exchange failed')


      `https:


      accessToken: longLivedData.access_token,
     


    code: string,
  ): Promise<OAuthCredenti
      method: 'POST',
     

        grant_typ
      })

   


      throw new Error(data.error?.message || 'TikTok authent

      accessToken: data.data.ac
      expiresAt: Date.now() + (data.data.expires_in * 1000)
  }

    config: { clientId: string; clientSecret
    const tokenUrl = new URL('https://graph.fac

    tokenUrl.searchParams.append('code', code)
    
    if (!response.ok) {
    }
    c

      expiresAt: Date.n
  }
  private async handleLinkedInCallback(
    config: { clientId:
    const response = await fetch('https://www.linkedin.com/oauth/
      headers: { 'Co
        grant_type: 'authorization_code',
        redirect_uri: 
        client_secret: config.clientSecret
    })
    if (!response.ok) {
    }
    const data = await response.json()
    r
   

  private generateState(): string {
  }
































































































































































